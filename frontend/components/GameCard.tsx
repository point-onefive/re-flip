"use client";

import { formatEther } from "viem";
import { Game, GameStatus } from "@/lib/contract";
import Link from "next/link";
import { useEthPrice, formatUsd } from "@/hooks/useEthPrice";

interface GameCardProps {
  game: Game;
  currentAddress?: `0x${string}`;
}

export function GameCard({ game, currentAddress }: GameCardProps) {
  const { ethPrice } = useEthPrice();
  const isCreator = currentAddress?.toLowerCase() === game.player1.toLowerCase();
  const isPlayer2 = currentAddress?.toLowerCase() === game.player2.toLowerCase();
  const isParticipant = isCreator || isPlayer2;

  const getStatusBadge = () => {
    switch (game.status) {
      case GameStatus.Open:
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            Open
          </span>
        );
      case GameStatus.Active:
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            In Progress
          </span>
        );
      case GameStatus.Complete:
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
            Complete
          </span>
        );
      case GameStatus.Cancelled:
        return (
          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const truncateAddress = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "—";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Link href={`/game/${game.id.toString()}`}>
      <div className="bg-gray-800 hover:bg-gray-750 active:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-xl p-3 sm:p-4 transition-all cursor-pointer touch-manipulation">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <div className="min-w-0">
            <span className="text-gray-400 text-xs sm:text-sm">Game #{game.id.toString()}</span>
            {isCreator && (
              <span className="ml-1 sm:ml-2 text-xs text-blue-400">(You)</span>
            )}
          </div>
          {getStatusBadge()}
        </div>

        <div className="mb-2 sm:mb-3">
          <div className="text-xl sm:text-2xl font-bold text-white">
            {formatEther(game.wagerAmount)} ETH
          </div>
          {ethPrice && (
            <div className="text-gray-400 text-sm">
              {formatUsd(parseFloat(formatEther(game.wagerAmount)), ethPrice)}
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Host</span>
            <span className="text-white font-mono">
              {truncateAddress(game.player1)}
            </span>
          </div>

          {game.player2 !== "0x0000000000000000000000000000000000000000" && (
            <div className="flex justify-between">
              <span className="text-gray-400">Challenger</span>
              <span className="text-white font-mono">
                {truncateAddress(game.player2)}
              </span>
            </div>
          )}

          {game.status === GameStatus.Complete && (
            <div className="flex justify-between">
              <span className="text-gray-400">Winner</span>
              <span className="text-green-400 font-mono">
                {truncateAddress(game.winner)}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-400">Round</span>
            <span className="text-white">{game.roundNumber.toString()}</span>
          </div>
        </div>

        {game.status === GameStatus.Open && !isCreator && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <span className="text-blue-400 text-sm font-medium">
              Click to join →
            </span>
          </div>
        )}

        {game.status === GameStatus.Active && isParticipant && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <span className="text-yellow-400 text-sm font-medium">
              {game.currentCaller.toLowerCase() === currentAddress?.toLowerCase()
                ? "Your turn to call! →"
                : "Waiting for opponent..."}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
