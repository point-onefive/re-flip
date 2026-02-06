"use client";

import { useReadContract, useAccount } from "wagmi";
import { formatEther } from "viem";
import Link from "next/link";
import { nftBattleV2Abi, NFT_BATTLE_V2_ADDRESS, GameV2, GameStatus } from "@/lib/nftBattleV2Contract";
import { WalletConnect } from "@/components/WalletConnect";
import { useEthPrice, formatUsd } from "@/hooks/useEthPrice";

export function GameHistoryContent() {
  const { address, isConnected } = useAccount();
  const { ethPrice } = useEthPrice();

  // Get player's games
  const { data: playerGamesData, isLoading } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getPlayerGames",
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  const games = (playerGamesData as GameV2[] | undefined) || [];
  
  // Filter to completed games only for history
  const completedGames = games.filter(g => Number(g.status) === GameStatus.Complete);
  
  // Sort by completion time (most recent first)
  const sortedGames = [...completedGames].sort((a, b) => Number(b.completedAt - a.completedAt));

  // Calculate stats
  const wins = sortedGames.filter(g => g.winner.toLowerCase() === address?.toLowerCase()).length;
  const losses = sortedGames.filter(g => g.winner.toLowerCase() !== address?.toLowerCase() && g.winner !== "0x0000000000000000000000000000000000000000").length;
  const ties = sortedGames.filter(g => g.winner === "0x0000000000000000000000000000000000000000").length;
  
  const totalWagered = sortedGames.reduce((sum, g) => sum + Number(g.wagerAmount), 0);
  const totalWon = sortedGames
    .filter(g => g.winner.toLowerCase() === address?.toLowerCase())
    .reduce((sum, g) => sum + Number(g.wagerAmount) * 2 * 0.975, 0); // Account for 2.5% fee

  const truncateAddress = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "Tie";
    if (address && addr.toLowerCase() === address.toLowerCase()) return "You";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getResultBadge = (game: GameV2) => {
    if (game.winner === "0x0000000000000000000000000000000000000000") {
      return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">Tie</span>;
    }
    if (game.winner.toLowerCase() === address?.toLowerCase()) {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Won</span>;
    }
    return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Lost</span>;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 bg-gray-950 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="text-2xl sm:text-3xl">⚔️</span>
            <span className="text-lg sm:text-xl font-bold">re:battle</span>
          </Link>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-4">
            ← Back to Lobby
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Battle History</h1>
          <p className="text-gray-400 mt-1">Your completed battles and stats</p>
        </div>

        {!isConnected ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🔗</div>
            <p className="text-gray-400 mb-4">Connect your wallet to see your battle history</p>
            <WalletConnect />
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            Loading your battles...
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{wins}</div>
                <div className="text-gray-400 text-sm">Wins</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{losses}</div>
                <div className="text-gray-400 text-sm">Losses</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : "—"}%
                </div>
                <div className="text-gray-400 text-sm">Win Rate</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {(totalWon / 1e18).toFixed(4)}
                </div>
                <div className="text-gray-400 text-sm">ETH Won</div>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 flex flex-wrap gap-4 sm:gap-8 text-sm">
              <div>
                <span className="text-gray-400">Total Games:</span>
                <span className="text-white ml-2">{sortedGames.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Total Wagered:</span>
                <span className="text-white ml-2">{(totalWagered / 1e18).toFixed(4)} ETH</span>
              </div>
              <div>
                <span className="text-gray-400">Ties:</span>
                <span className="text-white ml-2">{ties}</span>
              </div>
            </div>

            {/* Game List */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Completed Battles</h2>
              </div>

              {sortedGames.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="text-4xl mb-4">⚔️</div>
                  <p>No completed battles yet.</p>
                  <p className="text-sm mt-2">
                    <Link href="/" className="text-purple-400 hover:underline">
                      Start a battle
                    </Link>
                    {" "}to begin your history!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {sortedGames.map((game) => {
                    const opponent = game.player1.toLowerCase() === address?.toLowerCase()
                      ? game.player2
                      : game.player1;
                    const yourPower = game.player1.toLowerCase() === address?.toLowerCase()
                      ? game.player1Power
                      : game.player2Power;
                    const opponentPower = game.player1.toLowerCase() === address?.toLowerCase()
                      ? game.player2Power
                      : game.player1Power;

                    return (
                      <Link
                        key={game.id.toString()}
                        href={`/battle/${game.id.toString()}`}
                        className="block hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[60px]">
                              {getResultBadge(game)}
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                Battle #{game.id.toString()}
                              </div>
                              <div className="text-gray-500 text-xs">
                                vs {truncateAddress(opponent)} • {formatDate(game.completedAt)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">
                              {formatEther(game.wagerAmount)} ETH
                            </div>
                            <div className="text-gray-500 text-xs font-mono">
                              {Number(yourPower)} vs {Number(opponentPower)}
                            </div>
                            {game.usedVRF && (
                              <div className="text-green-400 text-xs flex items-center gap-1 justify-end mt-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                VRF
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
