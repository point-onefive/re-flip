"use client";

import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import Link from "next/link";
import { nftBattleV2Abi, NFT_BATTLE_V2_ADDRESS, GameV2, GameStatus, Deck } from "@/lib/nftBattleV2Contract";
import { useEffect, useState } from "react";

export function RecentGamesPanel() {
  const [recentGames, setRecentGames] = useState<GameV2[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get total game count
  const { data: gameCounter } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "gameCounter",
  });

  // Fetch recent games (last 20)
  // We'll fetch them one by one since there's no batch function
  const gamesToFetch = 20;
  
  // Create an array of game IDs to fetch
  const gameIds = gameCounter 
    ? Array.from({ length: Math.min(gamesToFetch, Number(gameCounter)) }, (_, i) => 
        BigInt(Number(gameCounter) - i)
      )
    : [];

  // Fetch each game - we'll use individual useReadContract hooks for first 10
  const { data: game1 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getGame",
    args: [gameIds[0] ?? BigInt(0)],
    query: { enabled: gameIds.length > 0 },
  });
  const { data: game2 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getGame",
    args: [gameIds[1] ?? BigInt(0)],
    query: { enabled: gameIds.length > 1 },
  });
  const { data: game3 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getGame",
    args: [gameIds[2] ?? BigInt(0)],
    query: { enabled: gameIds.length > 2 },
  });
  const { data: game4 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getGame",
    args: [gameIds[3] ?? BigInt(0)],
    query: { enabled: gameIds.length > 3 },
  });
  const { data: game5 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getGame",
    args: [gameIds[4] ?? BigInt(0)],
    query: { enabled: gameIds.length > 4 },
  });
  const { data: game6 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getGame",
    args: [gameIds[5] ?? BigInt(0)],
    query: { enabled: gameIds.length > 5 },
  });
  const { data: game7 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getGame",
    args: [gameIds[6] ?? BigInt(0)],
    query: { enabled: gameIds.length > 6 },
  });
  const { data: game8 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getGame",
    args: [gameIds[7] ?? BigInt(0)],
    query: { enabled: gameIds.length > 7 },
  });
  const { data: game9 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getGame",
    args: [gameIds[8] ?? BigInt(0)],
    query: { enabled: gameIds.length > 8 },
  });
  const { data: game10 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getGame",
    args: [gameIds[9] ?? BigInt(0)],
    query: { enabled: gameIds.length > 9 },
  });

  // Combine games into list
  useEffect(() => {
    const games = [game1, game2, game3, game4, game5, game6, game7, game8, game9, game10]
      .filter((g): g is GameV2 => g !== undefined && g !== null && (g as GameV2).id !== BigInt(0));
    setRecentGames(games);
    setIsLoading(false);
  }, [game1, game2, game3, game4, game5, game6, game7, game8, game9, game10]);

  // Calculate platform stats
  const completedGames = recentGames.filter(g => Number(g.status) === GameStatus.Complete);
  const totalVolume = completedGames.reduce((sum, g) => sum + Number(g.wagerAmount) * 2, 0);
  const totalGames = Number(gameCounter || 0);

  const truncateAddress = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "—";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) return "—";
    const date = new Date(Number(timestamp) * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case GameStatus.Open: return { text: "Open", color: "text-green-400 bg-green-500/20" };
      case GameStatus.WaitingVRF: return { text: "VRF...", color: "text-purple-400 bg-purple-500/20" };
      case GameStatus.Complete: return { text: "Done", color: "text-blue-400 bg-blue-500/20" };
      case GameStatus.Cancelled: return { text: "Cancelled", color: "text-gray-400 bg-gray-500/20" };
      default: return { text: "?", color: "text-gray-400 bg-gray-500/20" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Stats */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
          📊 Platform Stats
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">{totalGames}</div>
            <div className="text-gray-400 text-sm">Total Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-400">
              {completedGames.length}
            </div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">
              {(totalVolume / 1e18).toFixed(2)}
            </div>
            <div className="text-gray-400 text-sm">ETH Volume</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
              {recentGames.filter(g => g.usedVRF).length}
            </div>
            <div className="text-gray-400 text-sm">VRF Games</div>
          </div>
        </div>
      </div>

      {/* Recent Games List */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <span className="text-gray-500 text-sm">Last {recentGames.length} games</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            Loading recent games...
          </div>
        ) : recentGames.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-4">🎮</div>
            <p>No games played yet.</p>
            <p className="text-sm mt-2">Be the first to create a battle!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {recentGames.map((game) => {
              const status = getStatusLabel(Number(game.status));
              return (
                <Link
                  key={game.id.toString()}
                  href={`/battle/${game.id.toString()}`}
                  className="block hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                      <div>
                        <div className="text-white font-medium">
                          Battle #{game.id.toString()}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {truncateAddress(game.player1)} vs {truncateAddress(game.player2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {formatEther(game.wagerAmount)} ETH
                      </div>
                      <div className="text-gray-500 text-xs">
                        {formatDate(game.completedAt || game.createdAt)}
                      </div>
                      {game.usedVRF && Number(game.status) === GameStatus.Complete && (
                        <div className="text-green-400 text-xs">✓ VRF</div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center text-gray-500 text-sm">
        <p>Showing most recent games • Stats update in real-time</p>
      </div>
    </div>
  );
}
