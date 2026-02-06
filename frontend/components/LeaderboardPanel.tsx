"use client";

import { useReadContract, useAccount } from "wagmi";
import { nftBattleV2Abi, NFT_BATTLE_V2_ADDRESS, LeaderboardEntry, formatTimeRemaining } from "@/lib/nftBattleV2Contract";

export function LeaderboardPanel() {
  const { address } = useAccount();

  // Get current epoch info
  const { data: currentEpoch } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "currentEpoch",
  });

  const { data: epochEndTime } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "epochEndTime",
  });

  // Get leaderboard
  const { data: leaderboardData, isLoading } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getLeaderboard",
    args: [BigInt(10)], // Top 10
  });

  // Get user's stats
  const { data: userStats } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "getPlayerStats",
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  const truncateAddress = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "—";
    if (address && addr.toLowerCase() === address.toLowerCase()) return "You";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const leaderboard = leaderboardData as LeaderboardEntry[] | undefined;
  const stats = userStats as { wins: bigint; gamesPlayed: bigint } | undefined;

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return `${position + 1}.`;
    }
  };

  const getWinRate = (wins: bigint, gamesPlayed: bigint) => {
    if (gamesPlayed === BigInt(0)) return "—";
    const rate = (Number(wins) / Number(gamesPlayed)) * 100;
    return `${rate.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Epoch Info */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              🏆 Season {currentEpoch ? Number(currentEpoch) : "—"} Leaderboard
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Compete for the top spots and bragging rights
            </p>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-2xl font-bold text-purple-400">
              {epochEndTime ? formatTimeRemaining(epochEndTime as bigint) : "—"}
            </div>
            <div className="text-gray-500 text-sm">until reset</div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      {address && stats && (
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Your Stats This Season</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{Number(stats.wins)}</div>
              <div className="text-gray-400 text-sm">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{Number(stats.gamesPlayed)}</div>
              <div className="text-gray-400 text-sm">Games</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {getWinRate(stats.wins, stats.gamesPlayed)}
              </div>
              <div className="text-gray-400 text-sm">Win Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Top Players</h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            Loading leaderboard...
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-4">🏟️</div>
            <p>No battles completed this season yet.</p>
            <p className="text-sm mt-2">Be the first to claim the top spot!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = address && entry.player.toLowerCase() === address.toLowerCase();
              return (
                <div
                  key={entry.player}
                  className={`flex items-center justify-between px-4 py-3 ${
                    isCurrentUser ? "bg-purple-900/20" : ""
                  } ${index < 3 ? "py-4" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xl ${index < 3 ? "text-2xl" : "text-gray-500 w-8 text-center"}`}>
                      {getMedalEmoji(index)}
                    </span>
                    <div>
                      <span className={`font-mono ${isCurrentUser ? "text-purple-400 font-semibold" : "text-white"}`}>
                        {truncateAddress(entry.player)}
                      </span>
                      <div className="text-xs text-gray-500">
                        {Number(entry.gamesPlayed)} games • {getWinRate(entry.wins, entry.gamesPlayed)} win rate
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : index === 2 ? "text-orange-400" : "text-white"}`}>
                      {Number(entry.wins)} wins
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How it Works */}
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">How Seasons Work</h3>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>Each season lasts 7 days, then stats reset</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>Win battles to climb the leaderboard</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>Higher value battles may earn bonus points (coming soon)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>Top players get bragging rights each season!</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
