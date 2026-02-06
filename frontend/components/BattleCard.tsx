"use client";

import { formatEther } from "viem";
import { BattleGame, BattleGameStatus, KNOWN_COLLECTIONS } from "@/lib/nftBattleContract";
import Link from "next/link";
import { useEthPrice, formatUsd } from "@/hooks/useEthPrice";

interface BattleCardProps {
  game: BattleGame;
  currentAddress?: `0x${string}`;
}

export function BattleCard({ game, currentAddress }: BattleCardProps) {
  const { ethPrice } = useEthPrice();
  const isCreator = currentAddress?.toLowerCase() === game.player1.toLowerCase();
  const isPlayer2 = currentAddress?.toLowerCase() === game.player2.toLowerCase();
  const isParticipant = isCreator || isPlayer2;
  const collectionName = KNOWN_COLLECTIONS[game.collection]?.name || "Unknown";

  const getStatusBadge = () => {
    switch (Number(game.status)) {
      case BattleGameStatus.Open:
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            Open
          </span>
        );
      case BattleGameStatus.Active:
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            In Progress
          </span>
        );
      case BattleGameStatus.Drawing:
        return (
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
            Drawing
          </span>
        );
      case BattleGameStatus.Complete:
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
            Complete
          </span>
        );
      case BattleGameStatus.Cancelled:
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
    <Link href={`/battle/${game.id.toString()}`}>
      <div className="bg-gray-800 hover:bg-gray-750 active:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-xl p-3 sm:p-4 transition-all cursor-pointer touch-manipulation">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <div className="min-w-0">
            <span className="text-gray-400 text-xs sm:text-sm">Battle #{game.id.toString()}</span>
            {isCreator && (
              <span className="ml-1 sm:ml-2 text-xs text-purple-400">(You)</span>
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
            <span className="text-gray-400">Collection</span>
            <span className="text-purple-400 font-medium">{collectionName}</span>
          </div>

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

          {Number(game.status) === BattleGameStatus.Complete && (
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

        {Number(game.status) === BattleGameStatus.Open && !isCreator && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <span className="text-purple-400 text-sm font-medium">
              Click to join →
            </span>
          </div>
        )}

        {Number(game.status) === BattleGameStatus.Active && isParticipant && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <span className="text-yellow-400 text-sm font-medium">
              {game.currentDrawer.toLowerCase() === currentAddress?.toLowerCase()
                ? "Your turn to draw! →"
                : "Waiting for opponent..."}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
