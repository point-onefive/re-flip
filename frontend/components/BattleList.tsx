"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { nftBattleABI, NFT_BATTLE_CONTRACT_ADDRESS, BattleGame, BattleGameStatus } from "@/lib/nftBattleContract";
import { BattleCard } from "./BattleCard";

interface BattleListProps {
  currentAddress?: `0x${string}`;
  filter: "all" | "my-games";
  onRefresh?: number;
}

export function BattleList({ currentAddress, filter, onRefresh }: BattleListProps) {
  const [sortBy, setSortBy] = useState<"newest" | "wager-high" | "wager-low">("newest");
  
  // Get open games
  const { data: openGames, refetch: refetchOpenGames } = useReadContract({
    address: NFT_BATTLE_CONTRACT_ADDRESS,
    abi: nftBattleABI,
    functionName: "getOpenGames",
    query: {
      refetchInterval: 5000,
    },
  }) as { data: BattleGame[] | undefined; refetch: () => void };

  // Get user's games
  const { data: userGames, refetch: refetchUserGames } = useReadContract({
    address: NFT_BATTLE_CONTRACT_ADDRESS,
    abi: nftBattleABI,
    functionName: "getPlayerGames",
    args: [currentAddress!],
    query: {
      enabled: !!currentAddress,
      refetchInterval: 5000,
    },
  }) as { data: BattleGame[] | undefined; refetch: () => void };

  // Refresh when onRefresh changes
  useEffect(() => {
    refetchOpenGames();
    if (currentAddress) {
      refetchUserGames();
    }
  }, [onRefresh, refetchOpenGames, refetchUserGames, currentAddress]);

  // Refetch on window focus
  useEffect(() => {
    const handleFocus = () => {
      refetchOpenGames();
      if (currentAddress) {
        refetchUserGames();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOpenGames, refetchUserGames, currentAddress]);

  // Select which games to display
  const gamesToDisplay = filter === "my-games" ? userGames : openGames;

  // Sort games
  const sortedGames = [...(gamesToDisplay || [])].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return Number(b.createdAt) - Number(a.createdAt);
      case "wager-high":
        return Number(b.wagerAmount) - Number(a.wagerAmount);
      case "wager-low":
        return Number(a.wagerAmount) - Number(b.wagerAmount);
      default:
        return 0;
    }
  });

  // Filter out cancelled games for open games view
  const filteredGames = filter === "all"
    ? sortedGames.filter(g => Number(g.status) === BattleGameStatus.Open)
    : sortedGames;

  return (
    <div>
      {/* Sort controls */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="text-gray-400 text-xs sm:text-sm">
          {filter === "all" 
            ? `${filteredGames.length} open battles`
            : `${filteredGames.length} battles`}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-gray-800 border border-gray-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
        >
          <option value="newest">Newest First</option>
          <option value="wager-high">Highest Wager</option>
          <option value="wager-low">Lowest Wager</option>
        </select>
      </div>

      {/* Game grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredGames.map((game) => (
            <BattleCard
              key={game.id.toString()}
              game={game}
              currentAddress={currentAddress}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-400 text-base sm:text-lg mb-2">
            {filter === "all" 
              ? "No open battles available"
              : "You haven't played any battles yet"}
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            {filter === "all"
              ? "Be the first to create a battle!"
              : "Create a new battle to get started!"}
          </p>
        </div>
      )}
    </div>
  );
}
