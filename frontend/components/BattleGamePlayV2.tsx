"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import {
  nftBattleV2Abi,
  NFT_BATTLE_V2_ADDRESS,
  GameV2,
  GameStatus,
  Deck,
  formatGameStatus,
} from "@/lib/nftBattleV2Contract";
import { useRouter } from "next/navigation";
import { useEthPrice, formatUsd } from "@/hooks/useEthPrice";
import Link from "next/link";

interface BattleGamePlayV2Props {
  gameId: string;
}

export function BattleGamePlayV2({ gameId }: BattleGamePlayV2Props) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { ethPrice } = useEthPrice();
  const [mounted, setMounted] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [transitionOverlay, setTransitionOverlay] = useState<{
    show: boolean;
    emoji: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch game data with auto-polling
  const {
    data: game,
    refetch,
    isLoading,
  } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getGame",
    args: [BigInt(gameId)],
    query: {
      refetchInterval: 2000,
    },
  }) as { data: GameV2 | undefined; refetch: () => void; isLoading: boolean };

  // Fetch deck info
  const { data: deckData } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "decks",
    args: [game?.deckId ?? BigInt(1)],
    query: {
      enabled: !!game,
    },
  });

  const deck = deckData as Deck | undefined;

  // Join game
  const {
    data: joinHash,
    writeContract: joinGame,
    isPending: isJoining,
    error: joinError,
  } = useWriteContract();

  const { isLoading: isJoinConfirming, isSuccess: joinSuccess } =
    useWaitForTransactionReceipt({ hash: joinHash });

  // Cancel game
  const {
    data: cancelHash,
    writeContract: cancelGame,
    isPending: isCancelling,
  } = useWriteContract();

  const { isLoading: isCancelConfirming, isSuccess: cancelSuccess } =
    useWaitForTransactionReceipt({ hash: cancelHash });

  // Request rematch
  const {
    data: rematchHash,
    writeContract: requestRematch,
    isPending: isRequesting,
  } = useWriteContract();

  const { isLoading: isRematchConfirming, isSuccess: rematchSuccess } =
    useWaitForTransactionReceipt({ hash: rematchHash });

  // Handle join success
  useEffect(() => {
    if (joinSuccess) {
      setTransitionOverlay({
        show: true,
        emoji: "⚔️",
        title: "Battle Started!",
        subtitle: game?.wagerAmount && Number(game.wagerAmount) >= parseEther("0.02") 
          ? "Waiting for VRF randomness..." 
          : "Determining winner..."
      });
      setTimeout(() => setTransitionOverlay(null), 2000);
      refetch();
    }
  }, [joinSuccess, refetch, game?.wagerAmount]);

  // Handle cancel success
  useEffect(() => {
    if (cancelSuccess) {
      setTransitionOverlay({
        show: true,
        emoji: "👋",
        title: "Game Cancelled",
        subtitle: "Returning to lobby..."
      });
      setTimeout(() => router.push("/"), 1500);
    }
  }, [cancelSuccess, router]);

  // Handle rematch success
  useEffect(() => {
    if (rematchSuccess) {
      setTransitionOverlay({
        show: true,
        emoji: "🔄",
        title: "Rematch Requested!",
        subtitle: "Waiting for opponent..."
      });
      setTimeout(() => setTransitionOverlay(null), 2000);
      refetch();
    }
  }, [rematchSuccess, refetch]);

  // Detect game completion - show result modal
  useEffect(() => {
    if (game && Number(game.status) === GameStatus.Complete && !showResultModal) {
      setShowResultModal(true);
    }
  }, [game, showResultModal]);

  // Handlers
  const handleJoinGame = async () => {
    if (!game || !address) return;
    
    joinGame({
      address: NFT_BATTLE_V2_ADDRESS,
      abi: nftBattleV2Abi,
      functionName: "joinGame",
      args: [BigInt(gameId)],
      value: game.wagerAmount,
    });
  };

  const handleCancelGame = () => {
    cancelGame({
      address: NFT_BATTLE_V2_ADDRESS,
      abi: nftBattleV2Abi,
      functionName: "cancelGame",
      args: [BigInt(gameId)],
    });
  };

  const handleRequestRematch = () => {
    if (!game) return;
    
    requestRematch({
      address: NFT_BATTLE_V2_ADDRESS,
      abi: nftBattleV2Abi,
      functionName: "requestRematch",
      args: [BigInt(gameId)],
      value: game.wagerAmount,
    });
  };

  // Helper functions
  const truncateAddress = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "—";
    if (address && addr.toLowerCase() === address.toLowerCase()) return "You";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isPlayer1 = game?.player1.toLowerCase() === address?.toLowerCase();
  const isPlayer2 = game?.player2.toLowerCase() === address?.toLowerCase();
  const isParticipant = isPlayer1 || isPlayer2;
  const isCreator = isPlayer1;
  const isWinner = game?.winner.toLowerCase() === address?.toLowerCase();
  const isTie = game?.winner === "0x0000000000000000000000000000000000000000" && Number(game?.status) === GameStatus.Complete;

  const canJoin = game && Number(game.status) === GameStatus.Open && !isCreator && isConnected;
  const canCancel = game && Number(game.status) === GameStatus.Open && isCreator;
  const canRematch = game && 
    Number(game.status) === GameStatus.Complete && 
    isParticipant &&
    ((isPlayer1 && !game.player1WantsRematch) || (isPlayer2 && !game.player2WantsRematch));

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Game not found
  if (!game || game.id === BigInt(0)) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-white mb-2">Game Not Found</h2>
        <p className="text-gray-400 mb-4">This battle doesn&apos;t exist.</p>
        <Link href="/" className="text-purple-400 hover:underline">
          Back to Lobby →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Transition Overlay */}
      {transitionOverlay?.show && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl mb-4">{transitionOverlay.emoji}</div>
            <div className="text-2xl font-bold text-white mb-2">{transitionOverlay.title}</div>
            {transitionOverlay.subtitle && (
              <div className="text-gray-400">{transitionOverlay.subtitle}</div>
            )}
          </div>
        </div>
      )}

      {/* Game Header */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Battle #{gameId}
            </h1>
            <p className="text-gray-400 text-sm">
              {deck?.name || `Deck #${game.deckId}`}
            </p>
          </div>
          <StatusBadge status={Number(game.status)} />
        </div>

        {/* Wager Info */}
        <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">Total Pot</div>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {formatEther(game.wagerAmount * BigInt(2))} ETH
            </div>
            {ethPrice && (
              <div className="text-gray-400 text-sm">
                {formatUsd(parseFloat(formatEther(game.wagerAmount * BigInt(2))), ethPrice)}
              </div>
            )}
          </div>
        </div>

        {/* Players */}
        <div className="space-y-3">
          <PlayerCard
            label="Host"
            address={game.player1}
            power={Number(game.player1Power)}
            tokenId={Number(game.player1TokenId)}
            isWinner={game.winner.toLowerCase() === game.player1.toLowerCase()}
            isCurrentUser={isPlayer1}
            gameStatus={Number(game.status)}
            currentUserAddress={address}
            wantsRematch={game.player1WantsRematch}
          />
          
          {game.player2 !== "0x0000000000000000000000000000000000000000" ? (
            <PlayerCard
              label="Challenger"
              address={game.player2}
              power={Number(game.player2Power)}
              tokenId={Number(game.player2TokenId)}
              isWinner={game.winner.toLowerCase() === game.player2.toLowerCase()}
              isCurrentUser={isPlayer2}
              gameStatus={Number(game.status)}
              currentUserAddress={address}
              wantsRematch={game.player2WantsRematch}
            />
          ) : (
            <div className="bg-gray-700/30 border border-dashed border-gray-600 rounded-lg p-4 text-center">
              <span className="text-gray-400">Waiting for challenger...</span>
            </div>
          )}
        </div>
      </div>

      {/* VRF Status */}
      {Number(game.status) === GameStatus.WaitingVRF && (
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
            <div>
              <div className="text-purple-400 font-medium">Waiting for VRF Randomness</div>
              <div className="text-gray-400 text-sm">
                Chainlink VRF is generating provably fair random numbers...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VRF Verified Badge */}
      {Number(game.status) === GameStatus.Complete && game.usedVRF && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-green-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">VRF Verified Result</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            This battle used Chainlink VRF for provably fair randomness.
          </p>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && Number(game.status) === GameStatus.Complete && (
        <div className="bg-gray-800 rounded-xl p-6 mb-4 text-center">
          <div className="text-5xl mb-4">
            {isTie ? "🤝" : isWinner ? "🎉" : "😔"}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isTie ? "It's a Tie!" : isWinner ? "You Won!" : isParticipant ? "You Lost" : "Battle Complete"}
          </h2>
          
          <div className="text-gray-400 mb-4">
            {isTie ? (
              "Equal power scores - wagers refunded."
            ) : isWinner ? (
              <>
                You won{" "}
                <span className="text-green-400 font-bold">
                  {(parseFloat(formatEther(game.wagerAmount)) * 2 * 0.975).toFixed(4)} ETH
                </span>
              </>
            ) : isParticipant ? (
              "Better luck next time!"
            ) : (
              <>Winner: {truncateAddress(game.winner)}</>
            )}
          </div>

          <div className="text-gray-500 text-sm mb-4">
            Power: {Number(game.player1Power)} vs {Number(game.player2Power)}
          </div>

          {!showResultModal && (
            <button
              onClick={() => setShowResultModal(false)}
              className="text-gray-400 hover:text-white text-sm"
            >
              Close
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Join Button */}
        {canJoin && (
          <button
            onClick={handleJoinGame}
            disabled={isJoining || isJoinConfirming}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isJoining ? "Confirm in Wallet..." : 
             isJoinConfirming ? "Joining..." : 
             `Join Battle (${formatEther(game.wagerAmount)} ETH)`}
          </button>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <button
            onClick={handleCancelGame}
            disabled={isCancelling || isCancelConfirming}
            className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isCancelling || isCancelConfirming ? "Cancelling..." : "Cancel Battle"}
          </button>
        )}

        {/* Rematch Button */}
        {canRematch && (
          <button
            onClick={handleRequestRematch}
            disabled={isRequesting || isRematchConfirming}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isRequesting ? "Confirm in Wallet..." : 
             isRematchConfirming ? "Requesting..." : 
             `Request Rematch (${formatEther(game.wagerAmount)} ETH)`}
          </button>
        )}

        {/* Waiting for opponent states */}
        {Number(game.status) === GameStatus.Open && isCreator && (
          <div className="text-center text-gray-400 py-4">
            <div className="animate-pulse mb-2">⏳</div>
            Waiting for a challenger to join...
          </div>
        )}

        {/* Rematch status */}
        {Number(game.status) === GameStatus.Complete && isParticipant && (
          <RematchStatus 
            game={game} 
            isPlayer1={isPlayer1} 
            isPlayer2={isPlayer2}
          />
        )}

        {/* Error display */}
        {joinError && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
            {joinError.message}
          </div>
        )}

        {/* Back to lobby */}
        <Link 
          href="/"
          className="block text-center text-gray-400 hover:text-white text-sm py-2"
        >
          ← Back to Lobby
        </Link>
      </div>
    </div>
  );
}

// Sub-components

function StatusBadge({ status }: { status: number }) {
  switch (status) {
    case GameStatus.Open:
      return <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">Open</span>;
    case GameStatus.WaitingVRF:
      return <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full animate-pulse">🎲 VRF...</span>;
    case GameStatus.Complete:
      return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">Complete</span>;
    case GameStatus.Cancelled:
      return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-sm rounded-full">Cancelled</span>;
    default:
      return null;
  }
}

function PlayerCard({
  label,
  address,
  power,
  tokenId,
  isWinner,
  isCurrentUser,
  gameStatus,
  currentUserAddress,
  wantsRematch,
}: {
  label: string;
  address: string;
  power: number;
  tokenId: number;
  isWinner: boolean;
  isCurrentUser: boolean;
  gameStatus: number;
  currentUserAddress?: string;
  wantsRematch: boolean;
}) {
  const truncate = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "—";
    if (currentUserAddress && addr.toLowerCase() === currentUserAddress.toLowerCase()) return "You";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className={`bg-gray-700/50 rounded-lg p-4 ${isWinner && gameStatus === GameStatus.Complete ? 'ring-2 ring-green-500' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-gray-400 text-sm">{label}</span>
          {isCurrentUser && <span className="ml-2 text-purple-400 text-xs">(You)</span>}
        </div>
        {wantsRematch && (
          <span className="text-xs text-blue-400">🔄 Wants rematch</span>
        )}
      </div>
      <div className="font-mono text-white">{truncate(address)}</div>
      {gameStatus === GameStatus.Complete && power > 0 && (
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className="text-gray-400">Power: {power}</span>
          {tokenId > 0 && <span className="text-gray-500">Token #{tokenId}</span>}
          {isWinner && <span className="text-green-400">👑 Winner</span>}
        </div>
      )}
    </div>
  );
}

function RematchStatus({ game, isPlayer1, isPlayer2 }: { game: GameV2; isPlayer1: boolean; isPlayer2: boolean }) {
  const weRequestedRematch = (isPlayer1 && game.player1WantsRematch) || (isPlayer2 && game.player2WantsRematch);
  const opponentRequestedRematch = (isPlayer1 && game.player2WantsRematch) || (isPlayer2 && game.player1WantsRematch);
  
  if (weRequestedRematch && !opponentRequestedRematch) {
    return (
      <div className="text-center text-blue-400 text-sm py-2">
        ⏳ Waiting for opponent to accept rematch...
      </div>
    );
  }
  
  if (opponentRequestedRematch && !weRequestedRematch) {
    return (
      <div className="text-center text-blue-400 text-sm py-2">
        🔄 Opponent wants a rematch!
      </div>
    );
  }
  
  if (weRequestedRematch && opponentRequestedRematch) {
    return (
      <div className="text-center text-green-400 text-sm py-2">
        ✅ Both players agreed! Creating rematch...
      </div>
    );
  }
  
  return null;
}
