"use client";

import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
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
import { BattleRevealModal } from "./BattleRevealModal";

interface BattleGamePlayV2Props {
  gameId: string;
}

export function BattleGamePlayV2({ gameId }: BattleGamePlayV2Props) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { ethPrice } = useEthPrice();
  const [mounted, setMounted] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showBattleReveal, setShowBattleReveal] = useState(false);
  const hasShownReveal = useRef(false);
  const [rematchCountdown, setRematchCountdown] = useState<number | null>(null);
  const rematchTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  // Parse deck tuple: wagmi returns [collection, name, version, active, cardCount]
  const deck: Deck | undefined = deckData && Array.isArray(deckData) && deckData.length >= 5
    ? {
        collection: deckData[0] as `0x${string}`,
        name: deckData[1] as string,
        version: deckData[2] as bigint,
        active: deckData[3] as boolean,
        cardCount: deckData[4] as bigint,
      }
    : undefined;

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

  // Handle join success - just refetch to update the lobby view (don't show overlay)
  useEffect(() => {
    if (joinSuccess) {
      // Just refetch - let the lobby show both players before the battle modal
      refetch();
    }
  }, [joinSuccess, refetch]);

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

  // Handle rematch success - start 30 second countdown
  useEffect(() => {
    if (rematchSuccess) {
      // Start 30 second countdown
      setRematchCountdown(30);
      refetch();
    }
  }, [rematchSuccess, refetch]);

  // Rematch countdown timer
  useEffect(() => {
    if (rematchCountdown === null) return;
    
    if (rematchCountdown <= 0) {
      // Time expired - go back to lobby
      setRematchCountdown(null);
      setTransitionOverlay({
        show: true,
        emoji: "⏰",
        title: "Rematch Expired",
        subtitle: "Opponent didn't accept in time..."
      });
      setTimeout(() => router.push("/"), 2000);
      return;
    }
    
    rematchTimerRef.current = setTimeout(() => {
      setRematchCountdown(prev => prev !== null ? prev - 1 : null);
    }, 1000);
    
    return () => {
      if (rematchTimerRef.current) clearTimeout(rematchTimerRef.current);
    };
  }, [rematchCountdown, router]);

  // Watch for RematchCreated event - redirect to new game
  useWatchContractEvent({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    eventName: 'RematchCreated',
    onLogs(logs) {
      for (const log of logs) {
        const oldGameId = (log as any).args?.oldGameId;
        const newGameId = (log as any).args?.newGameId;
        
        if (oldGameId && BigInt(oldGameId) === BigInt(gameId)) {
          // Clear countdown
          setRematchCountdown(null);
          if (rematchTimerRef.current) clearTimeout(rematchTimerRef.current);
          
          // Show migration overlay
          setTransitionOverlay({
            show: true,
            emoji: "⚔️",
            title: "Rematch Starting!",
            subtitle: `Moving to Battle #${newGameId}...`
          });
          
          // Navigate to new game after brief delay
          setTimeout(() => {
            router.push(`/battle/${newGameId}`);
          }, 1500);
        }
      }
    },
  });

  // Also detect when opponent requests rematch (stop our countdown)
  useEffect(() => {
    if (game) {
      const isPlayer1 = address?.toLowerCase() === game.player1.toLowerCase();
      const isPlayer2 = address?.toLowerCase() === game.player2.toLowerCase();
      const bothWantRematch = game.player1WantsRematch && game.player2WantsRematch;
      
      // If both want rematch, the event handler will catch the redirect
      if (bothWantRematch && rematchCountdown !== null) {
        // Keep countdown running until event fires
      }
    }
  }, [game, address, rematchCountdown]);

  // Detect game completion - show both players in lobby first, then battle reveal modal
  useEffect(() => {
    if (game && Number(game.status) === GameStatus.Complete && !hasShownReveal.current) {
      // Clear any transition overlay to show the lobby with both players
      setTransitionOverlay(null);
      hasShownReveal.current = true;
      
      // Wait 2 seconds to let players see both cards in lobby, then show battle reveal
      setTimeout(() => {
        setShowBattleReveal(true);
      }, 2000);
    }
  }, [game]);

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
    <div className="max-w-xl mx-auto px-2">
      {/* Battle Reveal Modal */}
      {game && (
        <BattleRevealModal
          isOpen={showBattleReveal}
          onClose={() => {
            setShowBattleReveal(false);
            setShowResultModal(true);
          }}
          player1Address={game.player1}
          player2Address={game.player2}
          player1TokenId={Number(game.player1TokenId)}
          player2TokenId={Number(game.player2TokenId)}
          player1Power={Number(game.player1Power)}
          player2Power={Number(game.player2Power)}
          winner={game.winner}
          wagerAmount={game.wagerAmount}
          deckId={Number(game.deckId)}
          currentUserAddress={address}
        />
      )}

      {/* Transition Overlay */}
      {transitionOverlay?.show && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl mb-4">{transitionOverlay.emoji}</div>
            <div className="text-2xl font-bold text-white mb-2">{transitionOverlay.title}</div>
            {transitionOverlay.subtitle && (
              <div className="text-gray-400">{transitionOverlay.subtitle}</div>
            )}
            <div className="mt-4 flex justify-center">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Header */}
      <div className="bg-gray-800 rounded-xl p-3 sm:p-4 mb-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-white">
              Battle #{gameId}
            </h1>
            <span className="text-gray-500 text-sm">{deck?.name || `Deck #${game.deckId}`}</span>
          </div>
          <StatusBadge status={Number(game.status)} />
        </div>

        {/* Wager Info - Compact */}
        <div className="bg-gray-700/50 rounded-lg p-2 mb-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-400 text-sm">
              {Number(game.status) === GameStatus.Open ? "Wager:" : "Pot:"}
            </span>
            <span className="text-xl font-bold text-white">
              {Number(game.status) === GameStatus.Open 
                ? formatEther(game.wagerAmount)
                : formatEther(game.wagerAmount * BigInt(2))} ETH
            </span>
            {ethPrice && (
              <span className="text-gray-500 text-sm">
                ({Number(game.status) === GameStatus.Open
                  ? formatUsd(parseFloat(formatEther(game.wagerAmount)), ethPrice)
                  : formatUsd(parseFloat(formatEther(game.wagerAmount * BigInt(2))), ethPrice)})
              </span>
            )}
          </div>
        </div>

        {/* Players */}
        <div className="space-y-2">
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
            <div className="bg-gray-700/30 border border-dashed border-gray-600 rounded-lg p-3 text-center">
              <span className="text-gray-400 text-sm">Waiting for challenger...</span>
            </div>
          )}
        </div>
      </div>

      {/* VRF Status */}
      {Number(game.status) === GameStatus.WaitingVRF && (
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
            <span className="text-purple-400 text-sm">Waiting for VRF randomness...</span>
          </div>
        </div>
      )}

      {/* VRF Verified Badge */}
      {Number(game.status) === GameStatus.Complete && game.usedVRF && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-2 mb-3">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>VRF Verified</span>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && Number(game.status) === GameStatus.Complete && (
        <div className="bg-gray-800 rounded-lg p-3 mb-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl">{isTie ? "🤝" : isWinner ? "🎉" : "😔"}</span>
            <h2 className="text-lg font-bold text-white">
              {isTie ? "It's a Tie!" : isWinner ? "You Won!" : isParticipant ? "You Lost" : "Battle Complete"}
            </h2>
          </div>
          <div className="text-gray-400 text-sm">
            {isTie ? (
              "Equal power - wagers refunded"
            ) : isWinner ? (
              <>Won <span className="text-green-400 font-bold">{(parseFloat(formatEther(game.wagerAmount)) * 2 * 0.975).toFixed(4)} ETH</span></>
            ) : isParticipant ? (
              "Better luck next time!"
            ) : (
              <>Winner: {truncateAddress(game.winner)}</>
            )}
            <span className="text-gray-600 ml-2">({Number(game.player1Power)} vs {Number(game.player2Power)})</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Join Button */}
        {canJoin && (
          <button
            onClick={handleJoinGame}
            disabled={isJoining || isJoinConfirming}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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
            className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {isCancelling || isCancelConfirming ? "Cancelling..." : "Cancel Battle"}
          </button>
        )}

        {/* Rematch Button */}
        {canRematch && (
          <button
            onClick={handleRequestRematch}
            disabled={isRequesting || isRematchConfirming}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {isRequesting ? "Confirm in Wallet..." : 
             isRematchConfirming ? "Requesting..." : 
             `Request Rematch (${formatEther(game.wagerAmount)} ETH)`}
          </button>
        )}

        {/* Waiting for opponent states */}
        {Number(game.status) === GameStatus.Open && isCreator && (
          <div className="text-center text-gray-400 text-sm py-2">
            <span className="animate-pulse">⏳</span> Waiting for challenger...
          </div>
        )}

        {/* Rematch status */}
        {Number(game.status) === GameStatus.Complete && isParticipant && (
          <RematchStatus 
            game={game} 
            isPlayer1={isPlayer1} 
            isPlayer2={isPlayer2}
            countdown={rematchCountdown}
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
    <div className={`bg-gray-700/50 rounded-lg p-2 ${isWinner && gameStatus === GameStatus.Complete ? 'ring-2 ring-green-500' : ''}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">{label}:</span>
          <span className="font-mono text-white text-sm">{truncate(address)}</span>
          {isCurrentUser && <span className="text-purple-400 text-xs">(You)</span>}
        </div>
        <div className="flex items-center gap-2">
          {gameStatus === GameStatus.Complete && power > 0 && (
            <>
              <span className="text-gray-400 text-xs">#{tokenId}</span>
              <span className={`text-sm font-bold ${isWinner ? 'text-green-400' : 'text-white'}`}>
                {isWinner && '👑 '}{power}
              </span>
            </>
          )}
          {wantsRematch && <span className="text-xs text-blue-400">🔄</span>}
        </div>
      </div>
    </div>
  );
}

function RematchStatus({ game, isPlayer1, isPlayer2, countdown }: { game: GameV2; isPlayer1: boolean; isPlayer2: boolean; countdown: number | null }) {
  const weRequestedRematch = (isPlayer1 && game.player1WantsRematch) || (isPlayer2 && game.player2WantsRematch);
  const opponentRequestedRematch = (isPlayer1 && game.player2WantsRematch) || (isPlayer2 && game.player1WantsRematch);
  
  if (weRequestedRematch && !opponentRequestedRematch) {
    return (
      <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400">
            <span className="animate-pulse">⏳</span>
            <span className="text-sm">Waiting for opponent...</span>
          </div>
          {countdown !== null && (
            <div className={`text-lg font-bold ${countdown <= 5 ? 'text-red-400' : 'text-blue-400'}`}>
              {countdown}s
            </div>
          )}
        </div>
        {countdown !== null && countdown <= 5 && (
          <div className="text-xs text-red-400 mt-1">
            Rematch will expire soon!
          </div>
        )}
      </div>
    );
  }
  
  if (opponentRequestedRematch && !weRequestedRematch) {
    return (
      <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 text-center">
        <div className="text-green-400 font-medium">🔄 Opponent wants a rematch!</div>
        <div className="text-gray-400 text-xs mt-1">Click "Request Rematch" to accept</div>
      </div>
    );
  }
  
  if (weRequestedRematch && opponentRequestedRematch) {
    return (
      <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 text-center animate-pulse">
        <div className="text-purple-400 font-medium">✅ Creating rematch...</div>
      </div>
    );
  }
  
  return null;
}
