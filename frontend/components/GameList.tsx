"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { coinFlipABI, CONTRACT_ADDRESS, Game, GameStatus } from "@/lib/contract";
import { GameCard } from "./GameCard";

interface GameListProps {
  currentAddress?: `0x${string}`;
  filter: "all" | "my-games";
  onRefresh?: number; // Increment to trigger refresh
}

export function GameList({ currentAddress, filter, onRefresh }: GameListProps) {
  const [sortBy, setSortBy] = useState<"newest" | "wager-high" | "wager-low">("newest");
  
  // Get open games count
  const { data: openGamesCount, refetch: refetchCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: coinFlipABI,
    functionName: "getOpenGamesCount",
    query: {
      refetchInterval: 5000, // Poll every 5 seconds
    },
  });

  // Get open games
  const { data: openGames, refetch: refetchOpenGames } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: coinFlipABI,
    functionName: "getOpenGames",
    args: [BigInt(0), BigInt(100)],
    query: {
      refetchInterval: 5000, // Poll every 5 seconds
    },
  });

  // Get user's game IDs
  const { data: userGameIds, refetch: refetchUserGames } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: coinFlipABI,
    functionName: "getUserGames",
    args: [currentAddress!],
    query: {
      enabled: !!currentAddress,
      refetchInterval: 5000, // Poll every 5 seconds
    },
  });

  // Get user's games by IDs
  const { data: userGames, refetch: refetchUserGameDetails } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: coinFlipABI,
    functionName: "getGamesByIds",
    args: [userGameIds || []],
    query: {
      enabled: !!userGameIds && userGameIds.length > 0,
      refetchInterval: 5000,
    },
  });

  // Refresh when onRefresh changes
  useEffect(() => {
    refetchCount();
    refetchOpenGames();
    if (currentAddress) {
      refetchUserGames();
    }
  }, [onRefresh, refetchCount, refetchOpenGames, refetchUserGames, currentAddress]);

  // Refetch on window focus (when user comes back from game page)
  useEffect(() => {
    const handleFocus = () => {
      refetchCount();
      refetchOpenGames();
      if (currentAddress) {
        refetchUserGames();
        refetchUserGameDetails();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchCount, refetchOpenGames, refetchUserGames, refetchUserGameDetails, currentAddress]);

  // Select which games to display
  const gamesToDisplay = filter === "my-games" 
    ? (userGames as Game[] | undefined)
    : (openGames as Game[] | undefined);

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
    ? sortedGames.filter(g => g.status === GameStatus.Open)
    : sortedGames;

  return (
    <div>
      {/* Sort controls */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="text-gray-400 text-xs sm:text-sm">
          {filter === "all" 
            ? `${openGamesCount?.toString() || 0} open games`
            : `${filteredGames.length} games`}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-gray-800 border border-gray-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
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
            <GameCard
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
              ? "No open games available"
              : "You haven't played any games yet"}
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            {filter === "all"
              ? "Be the first to create a game!"
              : "Create a new game to get started!"}
          </p>
        </div>
      )}
    </div>
  );
}
