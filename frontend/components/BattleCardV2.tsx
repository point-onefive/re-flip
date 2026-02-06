"use client";

import { formatEther } from "viem";
import { GameV2, GameStatus, formatGameStatus } from "@/lib/nftBattleV2Contract";
import Link from "next/link";
import { useEthPrice, formatUsd } from "@/hooks/useEthPrice";

interface BattleCardV2Props {
  game: GameV2;
  currentAddress?: `0x${string}`;
  deckName?: string;
}

export function BattleCardV2({ game, currentAddress, deckName = "Unknown" }: BattleCardV2Props) {
  const { ethPrice } = useEthPrice();
  const isCreator = currentAddress?.toLowerCase() === game.player1.toLowerCase();
  const isPlayer2 = currentAddress?.toLowerCase() === game.player2.toLowerCase();
  const isParticipant = isCreator || isPlayer2;
  
  // Calculate age of game
  const gameAgeHours = (Date.now() / 1000 - Number(game.createdAt)) / 3600;
  const isOldOpenGame = Number(game.status) === GameStatus.Open && gameAgeHours > 24;
  const isStuckVRF = Number(game.status) === GameStatus.WaitingVRF && gameAgeHours > 1;

  const getStatusBadge = () => {
    switch (Number(game.status)) {
      case GameStatus.Open:
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            Open
          </span>
        );
      case GameStatus.WaitingVRF:
        return (
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full animate-pulse">
            🎲 VRF...
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

  const getWinnerLabel = () => {
    if (Number(game.status) !== GameStatus.Complete) return null;
    if (game.winner === "0x0000000000000000000000000000000000000000") return "Tie";
    if (game.winner.toLowerCase() === currentAddress?.toLowerCase()) return "You Won! 🎉";
    return truncateAddress(game.winner);
  };

  return (
    <Link href={`/battle/${game.id.toString()}`}>
      <div className="bg-gray-800 hover:bg-gray-750 active:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-xl p-3 sm:p-4 transition-all cursor-pointer touch-manipulation">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <div className="min-w-0">
            <span className="text-gray-400 text-xs sm:text-sm">Battle #{game.id.toString()}</span>
            {isCreator && (
              <span className="ml-1 sm:ml-2 text-xs text-purple-400">(Host)</span>
            )}
            {isPlayer2 && (
              <span className="ml-1 sm:ml-2 text-xs text-blue-400">(Challenger)</span>
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
            <span className="text-gray-400">Deck</span>
            <span className="text-purple-400 font-medium">{deckName}</span>
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

          {Number(game.status) === GameStatus.Complete && (
            <div className="flex justify-between">
              <span className="text-gray-400">Winner</span>
              <span className={`font-mono ${game.winner.toLowerCase() === currentAddress?.toLowerCase() ? 'text-green-400' : 'text-white'}`}>
                {getWinnerLabel()}
              </span>
            </div>
          )}

          {/* Power scores if game is complete */}
          {Number(game.status) === GameStatus.Complete && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Powers</span>
              <span className="text-gray-400 font-mono">
                {Number(game.player1Power)} vs {Number(game.player2Power)}
              </span>
            </div>
          )}

          {/* VRF indicator */}
          {game.usedVRF && Number(game.status) === GameStatus.Complete && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Randomness</span>
              <span className="text-green-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                VRF Verified
              </span>
            </div>
          )}
        </div>

        {Number(game.status) === GameStatus.Open && !isCreator && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <span className="text-purple-400 text-sm font-medium">
              Click to join →
            </span>
          </div>
        )}

        {Number(game.status) === GameStatus.WaitingVRF && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <span className="text-purple-400 text-sm font-medium animate-pulse">
              ⏳ Waiting for VRF randomness...
            </span>
          </div>
        )}

        {Number(game.status) === GameStatus.Open && isCreator && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <span className="text-gray-400 text-sm">
              Waiting for challenger...
            </span>
            {isOldOpenGame && (
              <div className="mt-2 text-xs text-yellow-500">
                ⚠️ Game open &gt;24h - Consider cancelling to get refund
              </div>
            )}
          </div>
        )}

        {/* Warning for stuck VRF */}
        {isStuckVRF && isParticipant && (
          <div className="mt-4 pt-3 border-t border-yellow-700/50 bg-yellow-900/20 -mx-3 sm:-mx-4 -mb-3 sm:-mb-4 px-3 sm:px-4 pb-3 sm:pb-4 rounded-b-xl">
            <span className="text-yellow-400 text-sm font-medium">
              ⚠️ VRF stuck &gt;1h - Click to rescue funds
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
