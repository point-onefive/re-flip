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
  coinFlipABI,
  CONTRACT_ADDRESS,
  Game,
  GameStatus,
  CoinSide,
} from "@/lib/contract";
import { useRouter } from "next/navigation";
import { useEthPrice, formatUsd } from "@/hooks/useEthPrice";

interface GamePlayProps {
  gameId: string;
}

export function GamePlay({ gameId }: GamePlayProps) {
  const router = useRouter();
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { ethPrice } = useEthPrice();
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [transitionOverlay, setTransitionOverlay] = useState<{
    show: boolean;
    emoji: string;
    title: string;
    subtitle?: string;
  } | null>(null);
  const [prevGameStatus, setPrevGameStatus] = useState<number | null>(null);
  const [prevPlayer2, setPrevPlayer2] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalData, setResultModalData] = useState<{
    won: boolean;
    amount: string;
    coinResult: string;
    yourCall: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch game data with auto-polling every 3 seconds
  const {
    data: game,
    refetch,
    isLoading,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: coinFlipABI,
    functionName: "getGame",
    args: [BigInt(gameId)],
    query: {
      refetchInterval: 3000, // Poll every 3 seconds
    },
  });

  // Also poll for potential rematch game (current game + 1)
  // This helps detect when rematch is created
  const nextGameId = BigInt(gameId) + BigInt(1);
  const { data: nextGame, refetch: refetchNextGame } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: coinFlipABI,
    functionName: "getGame",
    args: [nextGameId],
    query: {
      refetchInterval: 5000, // Poll less frequently
      enabled: !!game && Number(game.status) === GameStatus.Complete,
    },
  });

  // Join game
  const {
    data: joinHash,
    writeContract: joinGame,
    isPending: isJoining,
  } = useWriteContract();

  const { isLoading: isJoinConfirming, isSuccess: joinSuccess } =
    useWaitForTransactionReceipt({ hash: joinHash });

  // Call coin
  const {
    data: callHash,
    writeContract: callCoin,
    isPending: isCalling,
  } = useWriteContract();

  const { isLoading: isCallConfirming, isSuccess: callSuccess } =
    useWaitForTransactionReceipt({ hash: callHash });

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

  const { isLoading: isRematchConfirming, isSuccess: rematchSuccess, data: rematchReceipt } =
    useWaitForTransactionReceipt({ hash: rematchHash });

  // Cancel rematch request
  const {
    data: cancelRematchHash,
    writeContract: cancelRematchRequest,
    isPending: isCancellingRematch,
  } = useWriteContract();

  const { isLoading: isCancelRematchConfirming, isSuccess: cancelRematchSuccess } =
    useWaitForTransactionReceipt({ hash: cancelRematchHash });

  // Track transaction status for loading overlay
  useEffect(() => {
    if (isJoining) setTxStatus("Confirm in wallet...");
    else if (isJoinConfirming) setTxStatus("Joining game...");
    else if (isCalling) setTxStatus("Confirm in wallet...");
    else if (isCallConfirming) setTxStatus("Flipping coin...");
    else if (isCancelling) setTxStatus("Confirm in wallet...");
    else if (isCancelConfirming) setTxStatus("Cancelling game...");
    else if (isRequesting) setTxStatus("Confirm in wallet...");
    else if (isRematchConfirming) setTxStatus("Requesting rematch...");
    else if (isCancellingRematch) setTxStatus("Confirm in wallet...");
    else if (isCancelRematchConfirming) setTxStatus("Cancelling rematch request...");
    else setTxStatus(null);
  }, [isJoining, isJoinConfirming, isCalling, isCallConfirming, isCancelling, isCancelConfirming, isRequesting, isRematchConfirming, isCancellingRematch, isCancelRematchConfirming]);

  // Refetch after cancel rematch with confirmation
  useEffect(() => {
    if (cancelRematchSuccess) {
      setTransitionOverlay({
        show: true,
        emoji: "💰",
        title: "Rematch Cancelled",
        subtitle: "Your wager has been refunded!"
      });
      setTimeout(() => setTransitionOverlay(null), 2000);
      refetch();
      setWeRequestedRematch(false);
    }
  }, [cancelRematchSuccess, refetch]);

  // Refetch game data after join and show success overlay
  useEffect(() => {
    if (joinSuccess) {
      setTransitionOverlay({
        show: true,
        emoji: "✅",
        title: "Game Joined!",
        subtitle: "Pick your side to flip the coin!"
      });
      setTimeout(() => setTransitionOverlay(null), 2000);
      refetch();
    }
  }, [joinSuccess, refetch]);

  // Redirect to lobby after cancel with transition
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

  // Handle rematch success - show confirmation and refetch
  useEffect(() => {
    if (rematchSuccess) {
      setTransitionOverlay({
        show: true,
        emoji: "🔄",
        title: "Rematch Requested!",
        subtitle: "Waiting for opponent to accept..."
      });
      setTimeout(() => setTransitionOverlay(null), 2000);
      refetch();
      refetchNextGame();
    }
  }, [rematchSuccess, refetch, refetchNextGame]);

  // Track if we've already submitted our rematch request
  const [weRequestedRematch, setWeRequestedRematch] = useState(false);
  
  // When user clicks rematch, track it
  useEffect(() => {
    if (isRequesting || isRematchConfirming) {
      setWeRequestedRematch(true);
    }
  }, [isRequesting, isRematchConfirming]);

  // Auto-redirect to new game when rematch is created
  // Detection: Check if next game exists with both our players
  const [hasRedirectedToRematch, setHasRedirectedToRematch] = useState(false);
  
  useEffect(() => {
    if (
      game &&
      nextGame &&
      Number(game.status) === GameStatus.Complete &&
      weRequestedRematch &&
      !hasRedirectedToRematch &&
      // Verify next game is our rematch (has same players, is Active, and round > 1)
      nextGame.id === nextGameId &&
      Number(nextGame.status) === GameStatus.Active &&
      Number(nextGame.roundNumber) > 1 &&
      (nextGame.player1.toLowerCase() === address?.toLowerCase() ||
       nextGame.player2.toLowerCase() === address?.toLowerCase())
    ) {
      // Show transition overlay before redirect
      setTransitionOverlay({
        show: true,
        emoji: "🎮",
        title: "Rematch Accepted!",
        subtitle: `Redirecting to Game #${nextGameId.toString()}...`
      });
      
      // Redirect after brief delay
      setTimeout(() => {
        setHasRedirectedToRematch(true);
        router.push(`/game/${nextGameId.toString()}`);
      }, 1500);
    }
  }, [game, nextGame, nextGameId, weRequestedRematch, hasRedirectedToRematch, address, router]);

  // Detect when opponent joins (Open -> Active transition)
  useEffect(() => {
    if (game) {
      const currentStatus = Number(game.status);
      const currentPlayer2 = game.player2;
      
      // Opponent just joined! (was Open, now Active, and we're player1)
      if (
        prevGameStatus === GameStatus.Open &&
        currentStatus === GameStatus.Active &&
        prevPlayer2 === "0x0000000000000000000000000000000000000000" &&
        currentPlayer2 !== "0x0000000000000000000000000000000000000000" &&
        game.player1.toLowerCase() === address?.toLowerCase()
      ) {
        setTransitionOverlay({
          show: true,
          emoji: "🎉",
          title: "Opponent Joined!",
          subtitle: "Waiting for them to call..."
        });
        setTimeout(() => setTransitionOverlay(null), 2500);
      }
      
      // Update previous state
      setPrevGameStatus(currentStatus);
      setPrevPlayer2(currentPlayer2);
    }
  }, [game, prevGameStatus, prevPlayer2, address]);

  // Show coin flip animation on call success, then refetch and show result modal
  useEffect(() => {
    if (callSuccess) {
      setShowCoinFlip(true);
      // Wait for animation, then refetch to get result
      setTimeout(async () => {
        await refetch();
        setShowCoinFlip(false);
      }, 2500);
    }
  }, [callSuccess, refetch]);

  // Detect game completion and show result modal
  useEffect(() => {
    if (
      game &&
      prevGameStatus !== null &&
      prevGameStatus !== GameStatus.Complete &&
      Number(game.status) === GameStatus.Complete &&
      address &&
      !showResultModal
    ) {
      const isWinner = game.winner.toLowerCase() === address.toLowerCase();
      // Net profit = opponent's wager minus fee (wager * 0.99, since 1% fee on total pot)
      const netProfit = formatEther((game.wagerAmount * BigInt(99)) / BigInt(100));
      const coinResult = Number(game.result) === CoinSide.Heads ? "Heads" : "Tails";
      const callerChoice = Number(game.calledSide) === CoinSide.Heads ? "Heads" : "Tails";
      
      // Small delay after coin flip animation ends
      setTimeout(() => {
        setResultModalData({
          won: isWinner,
          amount: netProfit,
          coinResult,
          yourCall: callerChoice
        });
        setShowResultModal(true);
      }, 500);
    }
  }, [game, prevGameStatus, address, showResultModal]);

  // Show loading while mounting or fetching initial data
  // Also wait briefly for wallet address to be available after page navigation
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
        <p className="text-gray-400 mb-6">
          This game doesn&apos;t exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Back to Games
        </button>
      </div>
    );
  }

  const isCreator = address?.toLowerCase() === game.player1.toLowerCase();
  const isPlayer2 = address?.toLowerCase() === game.player2.toLowerCase();
  const isParticipant = isCreator || isPlayer2;
  const isCaller = address?.toLowerCase() === game.currentCaller.toLowerCase();
  const canJoin =
    Number(game.status) === GameStatus.Open && !isCreator && address;
  const canCall =
    Number(game.status) === GameStatus.Active && isCaller;
  const canCancel = Number(game.status) === GameStatus.Open && isCreator;

  const truncateAddress = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "Waiting...";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getSideLabel = (side: CoinSide) => {
    switch (side) {
      case CoinSide.Heads:
        return "Heads 🪙";
      case CoinSide.Tails:
        return "Tails 🪙";
      default:
        return "—";
    }
  };

  const handleJoin = () => {
    joinGame({
      address: CONTRACT_ADDRESS,
      abi: coinFlipABI,
      functionName: "joinGame",
      args: [BigInt(gameId)],
      value: game.wagerAmount,
    });
  };

  const handleCall = (side: CoinSide) => {
    callCoin({
      address: CONTRACT_ADDRESS,
      abi: coinFlipABI,
      functionName: "callCoin",
      args: [BigInt(gameId), side],
    });
  };

  const handleCancel = () => {
    cancelGame({
      address: CONTRACT_ADDRESS,
      abi: coinFlipABI,
      functionName: "cancelGame",
      args: [BigInt(gameId)],
    });
  };

  const handleRematch = () => {
    requestRematch({
      address: CONTRACT_ADDRESS,
      abi: coinFlipABI,
      functionName: "requestRematch",
      args: [BigInt(gameId)],
      value: game.wagerAmount,
    });
  };

  const handleCancelRematch = () => {
    cancelRematchRequest({
      address: CONTRACT_ADDRESS,
      abi: coinFlipABI,
      functionName: "cancelRematchRequest",
      args: [BigInt(gameId)],
    });
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/game/${gameId}`;
    navigator.clipboard.writeText(url);
    alert("Game link copied to clipboard!");
  };

  // Determine if we're in a waiting state (polling)
  const isWaitingForOpponent = 
    Number(game?.status) === GameStatus.Open && 
    game?.player1.toLowerCase() === address?.toLowerCase();
  
  const isWaitingForCall = 
    Number(game?.status) === GameStatus.Active && 
    game?.player1.toLowerCase() === address?.toLowerCase() &&
    !showCoinFlip;

  const isWaitingForResult = Number(game?.status) === GameStatus.Flipping;

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

      {/* Transition Overlay (for state changes) */}
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

      {/* Coin Flip Animation Overlay */}
      {showCoinFlip && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl sm:text-8xl animate-bounce mb-4">🪙</div>
            <div className="text-white text-xl sm:text-2xl font-bold">Flipping...</div>
          </div>
        </div>
      )}
      
      {/* Flipping Status Overlay (blockchain resolving) */}
      {isWaitingForResult && !showCoinFlip && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl sm:text-8xl animate-spin mb-4">🪙</div>
            <div className="text-white text-xl sm:text-2xl font-bold mb-2">Resolving...</div>
            <div className="text-gray-400 text-sm">Waiting for blockchain confirmation</div>
          </div>
        </div>
      )}

      {/* Win/Loss Result Modal */}
      {showResultModal && resultModalData && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 sm:p-10 text-center w-full max-w-sm border-4 ${
            resultModalData.won 
              ? 'bg-gradient-to-b from-green-900 to-green-950 border-green-500' 
              : 'bg-gradient-to-b from-red-900 to-red-950 border-red-500'
          }`}>
            {/* Big emoji */}
            <div className="text-7xl sm:text-8xl mb-4 animate-bounce">
              {resultModalData.won ? '🎉' : '😢'}
            </div>
            
            {/* Win/Loss text */}
            <div className={`text-4xl sm:text-5xl font-black mb-4 ${
              resultModalData.won ? 'text-green-400' : 'text-red-400'
            }`}>
              {resultModalData.won ? 'YOU WON!' : 'YOU LOST'}
            </div>
            
            {/* Amount */}
            <div className={`text-2xl sm:text-3xl font-bold mb-6 ${
              resultModalData.won ? 'text-green-300' : 'text-red-300'
            }`}>
              {resultModalData.won ? `+${resultModalData.amount} ETH` : `-${formatEther(game.wagerAmount)} ETH`}
            </div>
            
            {/* Coin result details */}
            <div className="bg-black/30 rounded-xl p-4 mb-6">
              <div className="text-gray-300 text-sm mb-2">Coin landed on</div>
              <div className="text-3xl mb-2">
                {resultModalData.coinResult === 'Heads' ? '🪙 Heads' : '🪙 Tails'}
              </div>
              <div className="text-gray-400 text-sm">
                {game.player2.toLowerCase() === address?.toLowerCase() 
                  ? `You called ${resultModalData.yourCall}` 
                  : `Opponent called ${resultModalData.yourCall}`}
              </div>
            </div>
            
            {/* Dismiss button */}
            <button
              onClick={() => setShowResultModal(false)}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-colors ${
                resultModalData.won 
                  ? 'bg-green-600 hover:bg-green-500 text-white' 
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {resultModalData.won ? '🎊 Awesome!' : 'Try Again'}
            </button>
          </div>
        </div>
      )}

      {/* Game Header */}
      <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-700">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Game #{game.id.toString()}
            </h1>
            <p className="text-gray-400 text-sm">Round {game.roundNumber.toString()}</p>
          </div>
          <div className="flex gap-2">
            {Number(game.status) === GameStatus.Open && (
              <button
                onClick={copyShareLink}
                className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-lg transition-colors touch-manipulation"
              >
                <span className="hidden sm:inline">Share Link </span>🔗
              </button>
            )}
          </div>
        </div>

        {/* Wager Info */}
        <div className="bg-gray-900 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="text-center">
            <div className="text-gray-400 text-xs sm:text-sm mb-1">Total Pot</div>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {formatEther(game.wagerAmount * BigInt(2))} ETH
            </div>
            {ethPrice && (
              <div className="text-gray-400 text-xs sm:text-sm">
                {formatUsd(parseFloat(formatEther(game.wagerAmount * BigInt(2))), ethPrice)}
              </div>
            )}
            <div className="text-green-400 text-xs sm:text-sm mt-1">
              Winner takes {formatEther((game.wagerAmount * BigInt(2) * BigInt(99)) / BigInt(100))} ETH
              {ethPrice && (
                <span className="text-green-400/60 ml-1 hidden sm:inline">
                  ({formatUsd(parseFloat(formatEther((game.wagerAmount * BigInt(2) * BigInt(99)) / BigInt(100))), ethPrice)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Players */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div
            className={`bg-gray-900 rounded-xl p-3 sm:p-4 ${
              game.winner === game.player1 && game.winner !== "0x0000000000000000000000000000000000000000"
                ? "ring-2 ring-green-500"
                : ""
            }`}
          >
            <div className="text-gray-400 text-xs sm:text-sm mb-1">Host</div>
            <div className="text-white font-mono text-xs sm:text-sm truncate">
              {truncateAddress(game.player1)}
            </div>
            {isCreator && (
              <div className="text-blue-400 text-xs mt-1">You</div>
            )}
            {game.winner === game.player1 && game.winner !== "0x0000000000000000000000000000000000000000" && (
              <div className="text-green-400 text-xs mt-1">🏆 Winner!</div>
            )}
          </div>
          <div
            className={`bg-gray-900 rounded-xl p-3 sm:p-4 ${
              game.winner === game.player2 && game.winner !== "0x0000000000000000000000000000000000000000"
                ? "ring-2 ring-green-500"
                : ""
            }`}
          >
            <div className="text-gray-400 text-xs sm:text-sm mb-1">Challenger</div>
            <div className="text-white font-mono text-xs sm:text-sm truncate">
              {truncateAddress(game.player2)}
            </div>
            {isPlayer2 && (
              <div className="text-blue-400 text-xs mt-1">You</div>
            )}
            {game.winner === game.player2 && game.winner !== "0x0000000000000000000000000000000000000000" && (
              <div className="text-green-400 text-xs mt-1">🏆 Winner!</div>
            )}
          </div>
        </div>

        {/* Game Status */}
        {Number(game.status) === GameStatus.Open && (
          <div className="text-center py-4">
            <div className="text-yellow-400 text-lg mb-2">
              ⏳ Waiting for opponent...
            </div>
            {isCreator && (
              <p className="text-gray-400 text-sm">
                Share the link with a friend or wait for someone to join!
              </p>
            )}
          </div>
        )}

        {Number(game.status) === GameStatus.Active && (
          <div className="text-center py-3 sm:py-4">
            <div className="text-yellow-400 text-base sm:text-lg mb-2">
              {isCaller
                ? "🎯 Your turn to call!"
                : `⏳ Waiting for ${truncateAddress(game.currentCaller)} to call...`}
            </div>
          </div>
        )}

        {Number(game.status) === GameStatus.Complete && (
          <div className="bg-gray-900 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-gray-400 text-xs sm:text-sm mb-2">Result</div>
            <div className="text-3xl sm:text-4xl mb-2">
              {Number(game.result) === CoinSide.Heads ? "🪙 Heads" : "🪙 Tails"}
            </div>
            <div className="text-sm sm:text-lg text-gray-400">
              {truncateAddress(game.currentCaller)} called{" "}
              {getSideLabel(game.calledSide)}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3 sm:space-y-4">
        {/* Join Game */}
        {canJoin && (
          <button
            onClick={handleJoin}
            disabled={isJoining || isJoinConfirming}
            className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-600 text-white font-bold py-4 px-4 sm:px-6 rounded-xl text-base sm:text-lg transition-colors touch-manipulation"
          >
            {isJoining
              ? "Confirm in Wallet..."
              : isJoinConfirming
              ? "Joining..."
              : `Join Game (${formatEther(game.wagerAmount)} ETH${ethPrice ? ` • ${formatUsd(parseFloat(formatEther(game.wagerAmount)), ethPrice)}` : ""})`}
          </button>
        )}

        {/* Call Coin */}
        {canCall && (
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <button
              onClick={() => handleCall(CoinSide.Heads)}
              disabled={isCalling || isCallConfirming}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-600 text-white font-bold py-5 sm:py-6 px-4 sm:px-6 rounded-xl text-lg sm:text-xl transition-colors touch-manipulation"
            >
              {isCalling || isCallConfirming ? "..." : "🪙 Heads"}
            </button>
            <button
              onClick={() => handleCall(CoinSide.Tails)}
              disabled={isCalling || isCallConfirming}
              className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-gray-600 text-white font-bold py-5 sm:py-6 px-4 sm:px-6 rounded-xl text-lg sm:text-xl transition-colors touch-manipulation"
            >
              {isCalling || isCallConfirming ? "..." : "🪙 Tails"}
            </button>
          </div>
        )}

        {/* Cancel Game */}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={isCancelling || isCancelConfirming}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-gray-600 text-white font-semibold py-3 px-4 sm:px-6 rounded-xl transition-colors touch-manipulation"
          >
            {isCancelling || isCancelConfirming
              ? "Cancelling..."
              : "Cancel Game & Refund"}
          </button>
        )}

        {/* Rematch */}
        {Number(game.status) === GameStatus.Complete && isParticipant && (
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
              Play Again?
            </h3>
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <div className="flex-1">
                <div className="text-xs sm:text-sm text-gray-400">Host</div>
                <div className="text-white text-sm sm:text-base">
                  {game.player1WantsRematch ? "✅ Ready" : "⏳ Waiting"}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs sm:text-sm text-gray-400">Challenger</div>
                <div className="text-white text-sm sm:text-base">
                  {game.player2WantsRematch ? "✅ Ready" : "⏳ Waiting"}
                </div>
              </div>
            </div>
            {/* Check if rematch game already exists (nextGame has our players and is Active) */}
            {nextGame && 
             Number(nextGame.status) === GameStatus.Active &&
             Number(nextGame.roundNumber) > 1 &&
             (nextGame.player1.toLowerCase() === address?.toLowerCase() ||
              nextGame.player2.toLowerCase() === address?.toLowerCase()) ? (
              <button
                onClick={() => router.push(`/game/${nextGameId.toString()}`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                🎮 Go to Rematch (Game #{nextGameId.toString()})
              </button>
            ) : game.player1WantsRematch && game.player2WantsRematch ? (
              <button
                onClick={() => router.push(`/game/${(game.id + BigInt(1)).toString()}`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                🎮 Go to Rematch (Game #{(game.id + BigInt(1)).toString()})
              </button>
            ) : !(
              (isCreator && game.player1WantsRematch) ||
              (isPlayer2 && game.player2WantsRematch)
            ) ? (
              <button
                onClick={handleRematch}
                disabled={isRequesting || isRematchConfirming}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                {isRequesting || isRematchConfirming
                  ? "Requesting..."
                  : `Request Rematch (${formatEther(game.wagerAmount)} ETH${ethPrice ? ` • ${formatUsd(parseFloat(formatEther(game.wagerAmount)), ethPrice)}` : ""})`}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="text-center text-yellow-400 py-2">
                  ⏳ Waiting for opponent to accept rematch...
                </div>
                <button
                  onClick={handleCancelRematch}
                  disabled={isCancellingRematch || isCancelRematchConfirming}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  {isCancellingRematch || isCancelRematchConfirming
                    ? "Cancelling..."
                    : `❌ Cancel Rematch Request (Refund ${formatEther(game.wagerAmount)} ETH)`}
                </button>
              </div>
            )}
            <p className="text-gray-500 text-xs mt-2 text-center">
              The other player called last time, so you&apos;ll call this round!
            </p>
          </div>
        )}

        {/* Exit/Leave Button - Different text based on game state and role */}
        <button
          onClick={() => router.push("/")}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {Number(game.status) === GameStatus.Complete
            ? isCreator
              ? "🚪 Close Game & Exit"
              : "🚪 Leave Game"
            : Number(game.status) === GameStatus.Open
            ? "← Back to Lobby"
            : "← Back to Games"}
        </button>
      </div>
    </div>
  );
}
