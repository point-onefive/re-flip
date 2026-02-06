"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther } from "viem";
import {
  nftBattleABI,
  NFT_BATTLE_CONTRACT_ADDRESS,
  BattleGame,
  BattleGameStatus,
  KNOWN_COLLECTIONS,
} from "@/lib/nftBattleContract";
import { useRouter } from "next/navigation";
import { useEthPrice, formatUsd } from "@/hooks/useEthPrice";
import { NFTBattleResult } from "./NFTReveal";

interface BattleGamePlayProps {
  gameId: string;
}

export function BattleGamePlay({ gameId }: BattleGamePlayProps) {
  const router = useRouter();
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { ethPrice } = useEthPrice();
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);
  const [transitionOverlay, setTransitionOverlay] = useState<{
    show: boolean;
    emoji: string;
    title: string;
    subtitle?: string;
  } | null>(null);
  const [prevGameStatus, setPrevGameStatus] = useState<number | null>(null);
  const [rematchWaitTime, setRematchWaitTime] = useState(0);
  const [gameCompleteIdleTime, setGameCompleteIdleTime] = useState(0);
  const [opponentRequestTime, setOpponentRequestTime] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch game data with auto-polling
  const {
    data: game,
    refetch,
    isLoading,
  } = useReadContract({
    address: NFT_BATTLE_CONTRACT_ADDRESS,
    abi: nftBattleABI,
    functionName: "getGame",
    args: [BigInt(gameId)],
    query: {
      refetchInterval: 3000,
    },
  }) as { data: BattleGame | undefined; refetch: () => void; isLoading: boolean };

  // Poll for next game (rematch) - poll faster to catch rematch acceptance quickly
  const nextGameId = BigInt(gameId) + BigInt(1);
  const { data: nextGame, refetch: refetchNextGame } = useReadContract({
    address: NFT_BATTLE_CONTRACT_ADDRESS,
    abi: nftBattleABI,
    functionName: "getGame",
    args: [nextGameId],
    query: {
      refetchInterval: 2000,
      enabled: !!game && Number(game.status) === BattleGameStatus.Complete,
    },
  }) as { data: BattleGame | undefined; refetch: () => void };

  // Join game
  const {
    data: joinHash,
    writeContract: joinGame,
    isPending: isJoining,
  } = useWriteContract();

  const { isLoading: isJoinConfirming, isSuccess: joinSuccess } =
    useWaitForTransactionReceipt({ hash: joinHash });

  // Draw (trigger battle)
  const {
    data: drawHash,
    writeContract: drawBattle,
    isPending: isDrawing,
  } = useWriteContract();

  const { isLoading: isDrawConfirming, isSuccess: drawSuccess } =
    useWaitForTransactionReceipt({ hash: drawHash });

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

  // Cancel rematch
  const {
    data: cancelRematchHash,
    writeContract: cancelRematchRequest,
    isPending: isCancellingRematch,
  } = useWriteContract();

  const { isLoading: isCancelRematchConfirming, isSuccess: cancelRematchSuccess } =
    useWaitForTransactionReceipt({ hash: cancelRematchHash });

  // Track transaction status
  useEffect(() => {
    if (isJoining) setTxStatus("Confirm in wallet...");
    else if (isJoinConfirming) setTxStatus("Joining game...");
    else if (isDrawing) setTxStatus("Confirm in wallet...");
    else if (isDrawConfirming) setTxStatus("Drawing NFTs...");
    else if (isCancelling) setTxStatus("Confirm in wallet...");
    else if (isCancelConfirming) setTxStatus("Cancelling game...");
    else if (isRequesting) setTxStatus("Confirm in wallet...");
    else if (isRematchConfirming) setTxStatus("Requesting rematch...");
    else if (isCancellingRematch) setTxStatus("Confirm in wallet...");
    else if (isCancelRematchConfirming) setTxStatus("Cancelling rematch...");
    else setTxStatus(null);
  }, [isJoining, isJoinConfirming, isDrawing, isDrawConfirming, isCancelling, isCancelConfirming, isRequesting, isRematchConfirming, isCancellingRematch, isCancelRematchConfirming]);

  // Handle join success
  useEffect(() => {
    if (joinSuccess) {
      setTransitionOverlay({
        show: true,
        emoji: "✅",
        title: "Game Joined!",
        subtitle: "NFTs will be drawn automatically..."
      });
      setTimeout(() => setTransitionOverlay(null), 2000);
      refetch();
    }
  }, [joinSuccess, refetch]);

  // Handle draw success - show result modal
  useEffect(() => {
    if (drawSuccess) {
      refetch();
      // Small delay then show result
      setTimeout(() => {
        setShowResultModal(true);
      }, 500);
    }
  }, [drawSuccess, refetch]);

  // Detect game completion (for spectators or when opponent draws)
  // Also show result modal if landing on already-completed game
  useEffect(() => {
    if (
      game &&
      Number(game.status) === BattleGameStatus.Complete &&
      !showResultModal
    ) {
      // If this is first load (prevGameStatus is null) and game is complete, show modal after brief delay
      if (prevGameStatus === null) {
        setTimeout(() => setShowResultModal(true), 500);
      } else if (prevGameStatus !== BattleGameStatus.Complete) {
        // Game just completed while we were watching
        setShowResultModal(true);
      }
    }
    if (game) {
      setPrevGameStatus(Number(game.status));
    }
  }, [game, prevGameStatus, showResultModal]);

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
      refetchNextGame();
    }
  }, [rematchSuccess, refetch, refetchNextGame]);

  // Handle cancel rematch
  useEffect(() => {
    if (cancelRematchSuccess) {
      setTransitionOverlay({
        show: true,
        emoji: "💰",
        title: "Rematch Cancelled",
        subtitle: "Wager refunded!"
      });
      setTimeout(() => setTransitionOverlay(null), 2000);
      refetch();
    }
  }, [cancelRematchSuccess, refetch]);

  // Track rematch request
  const [weRequestedRematch, setWeRequestedRematch] = useState(false);
  useEffect(() => {
    if (isRequesting || isRematchConfirming) {
      setWeRequestedRematch(true);
    }
  }, [isRequesting, isRematchConfirming]);

  // Track how long we've been waiting for rematch acceptance
  useEffect(() => {
    const weAreWaiting = game && (
      (game.player1.toLowerCase() === address?.toLowerCase() && game.player1WantsRematch && !game.player2WantsRematch) ||
      (game.player2.toLowerCase() === address?.toLowerCase() && game.player2WantsRematch && !game.player1WantsRematch)
    );
    
    if (weAreWaiting) {
      const timer = setInterval(() => {
        setRematchWaitTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setRematchWaitTime(0);
    }
  }, [game, address]);

  // Track idle time when game is complete and no one has requested rematch
  useEffect(() => {
    const userIsParticipant = game && address && (
      game.player1.toLowerCase() === address.toLowerCase() ||
      game.player2.toLowerCase() === address.toLowerCase()
    );
    const gameComplete = game && Number(game.status) === BattleGameStatus.Complete && userIsParticipant;
    const neitherRequested = game && !game.player1WantsRematch && !game.player2WantsRematch;
    
    if (gameComplete && neitherRequested) {
      const timer = setInterval(() => {
        setGameCompleteIdleTime(prev => {
          if (prev >= 30) {
            // Auto-redirect to lobby after 30s of no action
            router.push("/");
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setGameCompleteIdleTime(0);
    }
  }, [game, address, router]);

  // Track how long opponent's rematch request has been waiting for our response
  useEffect(() => {
    const opponentRequested = game && (
      (game.player1.toLowerCase() === address?.toLowerCase() && game.player2WantsRematch && !game.player1WantsRematch) ||
      (game.player2.toLowerCase() === address?.toLowerCase() && game.player1WantsRematch && !game.player2WantsRematch)
    );
    
    if (opponentRequested) {
      const timer = setInterval(() => {
        setOpponentRequestTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setOpponentRequestTime(0);
    }
  }, [game, address]);

  // Auto-redirect on rematch creation - works for BOTH players
  const [hasRedirectedToRematch, setHasRedirectedToRematch] = useState(false);
  useEffect(() => {
    if (
      game &&
      nextGame &&
      Number(game.status) === BattleGameStatus.Complete &&
      !hasRedirectedToRematch &&
      nextGame.id === nextGameId &&
      // With auto-execute, game goes straight to Complete (status 3), not Active (status 1)
      (Number(nextGame.status) === BattleGameStatus.Active || 
       Number(nextGame.status) === BattleGameStatus.Complete) &&
      Number(nextGame.roundNumber) > 1 &&
      // Check if we're a participant in the new game
      (nextGame.player1.toLowerCase() === address?.toLowerCase() ||
       nextGame.player2.toLowerCase() === address?.toLowerCase())
    ) {
      setHasRedirectedToRematch(true);
      setTransitionOverlay({
        show: true,
        emoji: "⚔️",
        title: "Rematch Accepted!",
        subtitle: `Loading Battle #${nextGameId.toString()}...`
      });
      setTimeout(() => {
        router.push(`/battle/${nextGameId.toString()}`);
      }, 2000);
    }
  }, [game, nextGame, nextGameId, hasRedirectedToRematch, router, address]);

  // Auto-draw when game becomes active and user is the drawer
  const [hasAutoDrawn, setHasAutoDrawn] = useState(false);
  const [autoDrawAttempted, setAutoDrawAttempted] = useState(false);
  
  useEffect(() => {
    if (
      game &&
      address &&
      Number(game.status) === BattleGameStatus.Active &&
      game.currentDrawer.toLowerCase() === address.toLowerCase() &&
      !hasAutoDrawn &&
      !autoDrawAttempted &&
      !isDrawing &&
      !isDrawConfirming
    ) {
      // Mark that we're attempting auto-draw
      setAutoDrawAttempted(true);
      setTransitionOverlay({
        show: true,
        emoji: "🎴",
        title: "Drawing NFTs...",
        subtitle: "Confirm in your wallet"
      });
      
      // Trigger draw after short delay
      setTimeout(() => {
        drawBattle({
          address: NFT_BATTLE_CONTRACT_ADDRESS,
          abi: nftBattleABI,
          functionName: "draw",
          args: [BigInt(gameId)],
        });
        setHasAutoDrawn(true);
      }, 500);
    }
  }, [game, address, hasAutoDrawn, autoDrawAttempted, isDrawing, isDrawConfirming, drawBattle, gameId]);

  // Clear overlay if draw fails or is rejected (no hash after attempting)
  useEffect(() => {
    if (autoDrawAttempted && !isDrawing && !isDrawConfirming && !drawHash && hasAutoDrawn) {
      // Draw was attempted but no transaction - user rejected or error
      setTimeout(() => {
        setTransitionOverlay(null);
        // Reset so user can try manual draw if needed
        setAutoDrawAttempted(false);
        setHasAutoDrawn(false);
      }, 2000);
    }
  }, [autoDrawAttempted, isDrawing, isDrawConfirming, drawHash, hasAutoDrawn]);

  // Loading states
  const walletStillLoading = isConnecting || isReconnecting || (isConnected && !address);
  
  if (!mounted || isLoading || walletStillLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!game || game.id === BigInt(0)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Game Not Found</h2>
        <p className="text-gray-400 mb-6">This game doesn&apos;t exist.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Back to Games
        </button>
      </div>
    );
  }

  const isCreator = game.player1.toLowerCase() === address?.toLowerCase();
  const isPlayer2 = game.player2.toLowerCase() === address?.toLowerCase();
  const isParticipant = isCreator || isPlayer2;
  const isDrawer = game.currentDrawer.toLowerCase() === address?.toLowerCase();
  const collectionName = KNOWN_COLLECTIONS[game.collection]?.name || "Unknown Collection";

  // Action handlers
  const handleJoin = () => {
    joinGame({
      address: NFT_BATTLE_CONTRACT_ADDRESS,
      abi: nftBattleABI,
      functionName: "joinGame",
      args: [BigInt(gameId)],
      value: game.wagerAmount,
    });
  };

  const handleDraw = () => {
    drawBattle({
      address: NFT_BATTLE_CONTRACT_ADDRESS,
      abi: nftBattleABI,
      functionName: "draw",
      args: [BigInt(gameId)],
    });
  };

  const handleCancel = () => {
    cancelGame({
      address: NFT_BATTLE_CONTRACT_ADDRESS,
      abi: nftBattleABI,
      functionName: "cancelGame",
      args: [BigInt(gameId)],
    });
  };

  const handleRematch = () => {
    requestRematch({
      address: NFT_BATTLE_CONTRACT_ADDRESS,
      abi: nftBattleABI,
      functionName: "requestRematch",
      args: [BigInt(gameId)],
      value: game.wagerAmount,
    });
  };

  const handleCancelRematch = () => {
    cancelRematchRequest({
      address: NFT_BATTLE_CONTRACT_ADDRESS,
      abi: nftBattleABI,
      functionName: "cancelRematchRequest",
      args: [BigInt(gameId)],
    });
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/battle/${gameId}`);
    alert("Link copied!");
  };

  return (
    <div className="max-w-2xl mx-auto relative px-1">
      {/* Transaction Loading Overlay */}
      {txStatus && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 text-center border border-gray-700 w-full max-w-xs">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-white text-base sm:text-lg font-semibold">{txStatus}</div>
            <div className="text-gray-400 text-xs sm:text-sm mt-2">Please wait...</div>
          </div>
        </div>
      )}

      {/* Transition Overlay */}
      {transitionOverlay?.show && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 text-center border border-gray-700 w-full max-w-xs">
            <div className="text-5xl sm:text-6xl mb-4">{transitionOverlay.emoji}</div>
            <div className="text-white text-lg sm:text-xl font-bold mb-2">{transitionOverlay.title}</div>
            {transitionOverlay.subtitle && (
              <div className="text-gray-400 text-sm sm:text-base mb-4">{transitionOverlay.subtitle}</div>
            )}
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {game && Number(game.status) === BattleGameStatus.Complete && (
        <NFTBattleResult
          show={showResultModal}
          onClose={() => setShowResultModal(false)}
          collectionAddress={game.collection}
          player1TokenId={Number(game.player1TokenId)}
          player2TokenId={Number(game.player2TokenId)}
          player1Power={Number(game.player1Power)}
          player2Power={Number(game.player2Power)}
          player1Label={isCreator ? "You" : "Opponent"}
          player2Label={isPlayer2 ? "You" : "Opponent"}
          winnerTokenId={game.player1Power > game.player2Power ? Number(game.player1TokenId) : Number(game.player2TokenId)}
          userWon={game.winner.toLowerCase() === address?.toLowerCase()}
          winAmount={formatEther((game.wagerAmount * BigInt(99)) / BigInt(100))}
          lossAmount={formatEther(game.wagerAmount)}
        />
      )}

      {/* Join Confirmation Modal */}
      {showJoinConfirm && game && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 w-full max-w-sm">
            <h2 className="text-xl font-bold text-white text-center mb-4">Confirm Battle Entry</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                <span className="text-gray-400">Wager Amount</span>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">{formatEther(game.wagerAmount)} ETH</div>
                  {ethPrice && (
                    <div className="text-gray-400 text-sm">
                      {formatUsd(parseFloat(formatEther(game.wagerAmount)), ethPrice)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                <span className="text-gray-400">Collection</span>
                <span className="text-purple-400 font-medium">{collectionName}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                <span className="text-gray-400">Opponent</span>
                <span className="text-white font-mono text-sm">
                  {game.player1.slice(0, 6)}...{game.player1.slice(-4)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                <span className="text-gray-400">Potential Win</span>
                <div className="text-right">
                  <div className="text-green-400 font-bold">
                    {formatEther((game.wagerAmount * BigInt(198)) / BigInt(100))} ETH
                  </div>
                  {ethPrice && (
                    <div className="text-green-400/70 text-sm">
                      {formatUsd(parseFloat(formatEther((game.wagerAmount * BigInt(198)) / BigInt(100))), ethPrice)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowJoinConfirm(false);
                  handleJoin();
                }}
                disabled={isJoining || isJoinConfirming}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-4 rounded-xl transition-colors text-lg"
              >
                {isJoining || isJoinConfirming ? "Joining..." : "⚔️ Confirm & Join Battle"}
              </button>
              
              <button
                onClick={() => setShowJoinConfirm(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Header */}
      <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-700">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Battle #{game.id.toString()}
            </h1>
            <p className="text-gray-400 text-sm">Round {game.roundNumber.toString()}</p>
          </div>
          <div className="flex gap-2">
            {Number(game.status) === BattleGameStatus.Open && (
              <button
                onClick={copyShareLink}
                className="bg-gray-700 hover:bg-gray-600 text-white text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-lg"
              >
                🔗
              </button>
            )}
          </div>
        </div>

        {/* Collection & Wager Info */}
        <div className="bg-gray-900 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Collection</span>
            <span className="text-purple-400 font-semibold">{collectionName}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Wager</span>
            <div className="text-right">
              <span className="text-white font-bold">{formatEther(game.wagerAmount)} ETH</span>
              {ethPrice && (
                <span className="text-gray-500 text-sm ml-2">
                  ({formatUsd(parseFloat(formatEther(game.wagerAmount)), ethPrice)})
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total Pot</span>
            <span className="text-green-400 font-bold">
              {formatEther(game.wagerAmount * BigInt(2))} ETH
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            Number(game.status) === BattleGameStatus.Open
              ? isCreator ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
              : Number(game.status) === BattleGameStatus.Active
              ? "bg-blue-500/20 text-blue-400"
              : Number(game.status) === BattleGameStatus.Drawing
              ? "bg-purple-500/20 text-purple-400"
              : Number(game.status) === BattleGameStatus.Complete
              ? "bg-green-500/20 text-green-400"
              : "bg-gray-500/20 text-gray-400"
          }`}>
            {Number(game.status) === BattleGameStatus.Open && (isCreator ? "⏳ Waiting for Opponent" : "🎮 Ready to Join")}
            {Number(game.status) === BattleGameStatus.Active && "⚔️ Ready to Battle"}
            {Number(game.status) === BattleGameStatus.Drawing && "🎲 Drawing..."}
            {Number(game.status) === BattleGameStatus.Complete && "✅ Complete"}
            {Number(game.status) === BattleGameStatus.Cancelled && "❌ Cancelled"}
          </span>
        </div>
      </div>

      {/* Players Section */}
      <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Players</h3>
        <div className="space-y-3">
          {/* Player 1 */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            isCreator ? "bg-blue-900/30 border border-blue-500/50" : "bg-gray-900"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                P1
              </div>
              <div>
                <div className="text-white text-sm font-mono">
                  {game.player1.slice(0, 6)}...{game.player1.slice(-4)}
                </div>
                <div className="text-gray-400 text-xs">
                  {isCreator ? "You" : "Host"}
                </div>
              </div>
            </div>
            {Number(game.status) === BattleGameStatus.Complete && game.winner === game.player1 && (
              <span className="text-green-400 text-sm">🏆 Winner</span>
            )}
          </div>

          {/* Player 2 */}
          {game.player2 !== "0x0000000000000000000000000000000000000000" ? (
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              isPlayer2 ? "bg-blue-900/30 border border-blue-500/50" : "bg-gray-900"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                  P2
                </div>
                <div>
                  <div className="text-white text-sm font-mono">
                    {game.player2.slice(0, 6)}...{game.player2.slice(-4)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {isPlayer2 ? "You" : "Challenger"}
                  </div>
                </div>
              </div>
              {Number(game.status) === BattleGameStatus.Complete && game.winner === game.player2 && (
                <span className="text-green-400 text-sm">🏆 Winner</span>
              )}
            </div>
          ) : (
            <div className={`flex items-center justify-center p-3 rounded-lg border border-dashed ${
              isCreator ? "bg-gray-900 border-gray-600" : "bg-green-900/20 border-green-500/50"
            }`}>
              <span className={isCreator ? "text-gray-400" : "text-green-400 font-medium"}>
                {isCreator ? "Waiting for opponent..." : "👆 This is your spot - Join below!"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Open Game - Join */}
        {Number(game.status) === BattleGameStatus.Open && !isCreator && isConnected && (
          <button
            onClick={() => setShowJoinConfirm(true)}
            disabled={isJoining || isJoinConfirming}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors text-lg"
          >
            {isJoining || isJoinConfirming
              ? "Joining..."
              : `⚔️ Join Battle`}
          </button>
        )}

        {/* Open Game - Cancel (creator only) */}
        {Number(game.status) === BattleGameStatus.Open && isCreator && (
          <button
            onClick={handleCancel}
            disabled={isCancelling || isCancelConfirming}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {isCancelling || isCancelConfirming ? "Cancelling..." : "❌ Cancel Game"}
          </button>
        )}

        {/* Active Game - Auto-drawing in progress or manual fallback */}
        {Number(game.status) === BattleGameStatus.Active && isParticipant && (
          isDrawing || isDrawConfirming ? (
            <div className="text-center text-purple-400 py-4 bg-purple-500/10 rounded-xl animate-pulse">
              🎴 Drawing NFTs...
            </div>
          ) : isDrawer ? (
            <button
              onClick={() => {
                setAutoDrawAttempted(true);
                setHasAutoDrawn(true);
                drawBattle({
                  address: NFT_BATTLE_CONTRACT_ADDRESS,
                  abi: nftBattleABI,
                  functionName: "draw",
                  args: [BigInt(gameId)],
                });
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors text-lg"
            >
              🎴 Draw NFTs
            </button>
          ) : (
            <div className="text-center text-yellow-400 py-4 bg-yellow-500/10 rounded-xl">
              ⏳ Waiting for opponent to draw...
            </div>
          )
        )}

        {/* Complete Game - Show Results Button */}
        {Number(game.status) === BattleGameStatus.Complete && isParticipant && (
          <button
            onClick={() => setShowResultModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            👀 View Battle Result
          </button>
        )}

        {/* Complete Game - Rematch */}
        {Number(game.status) === BattleGameStatus.Complete && isParticipant && (
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            {game.player1WantsRematch && game.player2WantsRematch ? (
              // Both requested - go to new game
              <button
                onClick={() => router.push(`/battle/${(game.id + BigInt(1)).toString()}`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl"
              >
                🎮 Go to Rematch
              </button>
            ) : (isCreator && game.player1WantsRematch) || (isPlayer2 && game.player2WantsRematch) ? (
              // We requested, waiting for opponent
              <div className="space-y-3">
                <div className="text-center text-yellow-400 py-2">
                  ⏳ Waiting for opponent to accept... {rematchWaitTime < 30 ? `(${30 - rematchWaitTime}s)` : ""}
                </div>
                {rematchWaitTime >= 30 && (
                  <div className="text-center text-gray-400 text-sm py-2 bg-gray-900 rounded-lg">
                    💡 No response yet. Opponent may have left.<br/>
                    Cancel below to get your ETH back.
                  </div>
                )}
                <button
                  onClick={handleCancelRematch}
                  disabled={isCancellingRematch || isCancelRematchConfirming}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl"
                >
                  {isCancellingRematch || isCancelRematchConfirming
                    ? "Cancelling..."
                    : `❌ Cancel Rematch (Refund ${formatEther(game.wagerAmount)} ETH)`}
                </button>
              </div>
            ) : (isCreator && game.player2WantsRematch) || (isPlayer2 && game.player1WantsRematch) ? (
              // Opponent requested, we can accept
              <div className="space-y-3">
                <div className="text-center text-green-400 py-2">
                  🔔 Opponent wants a rematch! {opponentRequestTime < 30 ? `(${30 - opponentRequestTime}s to respond)` : ""}
                </div>
                {opponentRequestTime >= 30 && (
                  <div className="text-center text-gray-400 text-sm py-2 bg-gray-900 rounded-lg">
                    ⏰ Time&apos;s up! Make a decision or head back to lobby.
                  </div>
                )}
                <button
                  onClick={handleRematch}
                  disabled={isRequesting || isRematchConfirming}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl animate-pulse"
                >
                  {isRequesting || isRematchConfirming
                    ? "Accepting..."
                    : `✅ Accept Rematch (${formatEther(game.wagerAmount)} ETH)`}
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-xl text-sm"
                >
                  Decline & Leave
                </button>
              </div>
            ) : (
              // Neither requested yet
              <div className="space-y-3">
                <div className="text-center text-gray-400 text-xs py-1">
                  Want to play again? {gameCompleteIdleTime < 30 
                    ? `Request a rematch or head back. (${30 - gameCompleteIdleTime}s before auto-return)`
                    : "Auto-returning to lobby..."}
                </div>
                <button
                  onClick={handleRematch}
                  disabled={isRequesting || isRematchConfirming}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl"
                >
                  {isRequesting || isRematchConfirming
                    ? "Requesting..."
                    : `🔄 Request Rematch (${formatEther(game.wagerAmount)} ETH)`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Exit Button */}
        <button
          onClick={() => router.push("/")}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          🚪 Back to Lobby
        </button>
      </div>
    </div>
  );
}
