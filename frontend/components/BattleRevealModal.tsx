"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatEther } from "viem";
import { useNFTImages } from "@/hooks/useNFTImage";
import { getTokenPowerData, TraitPower } from "@/lib/traitPowerData";

// Map deck IDs to collection addresses
const DECK_TO_COLLECTION: Record<number, string> = {
  1: "0x56dFE6ae26bf3043DC8Fdf33bF739B4fF4B3BC4A", // re:generates
};

interface BattleRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  player1Address: string;
  player2Address: string;
  player1TokenId: number;
  player2TokenId: number;
  player1Power: number;
  player2Power: number;
  winner: string;
  wagerAmount: bigint;
  deckId: number;
  currentUserAddress?: string;
}

type RevealPhase = "countdown" | "spinning" | "cards-revealed" | "power-revealed" | "winner" | "complete";

export function BattleRevealModal({
  isOpen,
  onClose,
  player1Address,
  player2Address,
  player1TokenId,
  player2TokenId,
  player1Power,
  player2Power,
  winner,
  wagerAmount,
  deckId,
  currentUserAddress,
}: BattleRevealModalProps) {
  const [phase, setPhase] = useState<RevealPhase>("countdown");
  const [countdown, setCountdown] = useState(3);
  
  // Fetch NFT images using collection address
  const collectionAddress = DECK_TO_COLLECTION[deckId];
  const { images } = useNFTImages(
    collectionAddress,
    [player1TokenId, player2TokenId]
  );
  
  // Get image and metadata from the Map
  const player1Data = images.get(player1TokenId);
  const player2Data = images.get(player2TokenId);
  const player1Image = player1Data?.url;
  const player2Image = player2Data?.url;
  
  // Get trait power data from deck data (now has ALL tokens with real rarity-based powers)
  const player1PowerData = getTokenPowerData(player1TokenId);
  const player2PowerData = getTokenPowerData(player2TokenId);
  
  const player1TraitPowers: TraitPower[] = player1PowerData?.traitPowers || [];
  const player2TraitPowers: TraitPower[] = player2PowerData?.traitPowers || [];

  // Animation sequence
  useEffect(() => {
    if (!isOpen) {
      setPhase("countdown");
      setCountdown(3);
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    // Countdown: 3, 2, 1
    timers.push(setTimeout(() => setCountdown(2), 1000));
    timers.push(setTimeout(() => setCountdown(1), 2000));
    
    // Phase transitions
    timers.push(setTimeout(() => setPhase("spinning"), 3000));      // After countdown
    timers.push(setTimeout(() => setPhase("cards-revealed"), 5000)); // After 2s spinning
    timers.push(setTimeout(() => setPhase("power-revealed"), 7000)); // After 2s cards shown
    timers.push(setTimeout(() => setPhase("winner"), 9000));         // After 2s power shown
    timers.push(setTimeout(() => setPhase("complete"), 10000));      // After 1s winner highlight

    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  if (!isOpen) return null;

  const truncateAddress = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "—";
    if (currentUserAddress && addr.toLowerCase() === currentUserAddress.toLowerCase()) return "You";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isTie = winner === "0x0000000000000000000000000000000000000000";
  const isPlayer1Winner = winner.toLowerCase() === player1Address.toLowerCase();
  const isPlayer2Winner = winner.toLowerCase() === player2Address.toLowerCase();
  const isCurrentUserWinner = currentUserAddress && winner.toLowerCase() === currentUserAddress.toLowerCase();
  const isCurrentUserPlayer = currentUserAddress && 
    (player1Address.toLowerCase() === currentUserAddress.toLowerCase() ||
     player2Address.toLowerCase() === currentUserAddress.toLowerCase());

  const winAmount = (parseFloat(formatEther(wagerAmount)) * 2 * 0.975).toFixed(4);
  
  // Only show winner styling in winner/complete phases
  const showWinner = phase === "winner" || phase === "complete";

  // Card component - identical for both players, same size always
  const BattleCard = ({ 
    label, 
    address, 
    tokenId, 
    image, 
    power, 
    traitPowers,
    isWinner,
  }: { 
    label: string;
    address: string;
    tokenId: number;
    image?: string;
    power: number;
    traitPowers: TraitPower[];
    isWinner: boolean;
  }) => (
    <div className={`w-[160px] sm:w-[180px] transition-all duration-500 ${
      showWinner && isWinner ? "ring-2 ring-green-500 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.4)]" : ""
    } ${showWinner && !isWinner && !isTie ? "opacity-50" : ""}`}>
      {/* Winner badge - only show in winner/complete phase */}
      {showWinner && isWinner && (
        <div className="text-center mb-1">
          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            👑 WINNER
          </span>
        </div>
      )}
      {/* Spacer when not winner to keep alignment */}
      {showWinner && !isWinner && !isTie && <div className="h-5 mb-1" />}
      
      <div className="bg-gray-800 rounded-lg p-2">
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <div>
            <span className="text-gray-500 text-[10px]">{label}</span>
            <div className="text-white font-mono text-xs">{truncateAddress(address)}</div>
          </div>
          <div className="text-purple-400 font-bold text-xs">#{tokenId}</div>
        </div>
        
        {/* Card image - fixed size */}
        <div className="relative w-full aspect-square bg-gray-700 rounded overflow-hidden">
          {phase === "countdown" || phase === "spinning" ? (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_200%] animate-gradient-spin flex items-center justify-center">
              <div className="text-4xl animate-spin" style={{ animationDuration: "0.5s" }}>🎴</div>
            </div>
          ) : image ? (
            <Image src={image} alt={`#${tokenId}`} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl">🖼️</span>
            </div>
          )}
        </div>

        {/* Power - always same height, hidden until power phase */}
        <div className={`text-center py-1 transition-opacity duration-300 ${
          phase === "countdown" || phase === "spinning" || phase === "cards-revealed" ? "opacity-0" : "opacity-100"
        }`}>
          <div className={`text-xl font-bold ${showWinner && isWinner ? "text-green-400" : "text-white"}`}>
            {power}
          </div>
          <div className="text-gray-500 text-[9px] uppercase">Power</div>
        </div>
        
        {/* Traits with power points - sorted by rarity (highest power = rarest) */}
        <div className={`h-[100px] overflow-hidden transition-opacity duration-300 ${
          phase === "countdown" || phase === "spinning" || phase === "cards-revealed" ? "opacity-0" : "opacity-100"
        }`}>
          {traitPowers.length > 0 && (
            <div className="bg-gray-900/50 rounded p-1 text-[9px] space-y-0.5">
              {[...traitPowers].sort((a, b) => b.power - a.power).map((tp, i) => (
                <div key={i} className={`flex justify-between gap-1 items-center ${
                  tp.power >= 50 ? "text-yellow-400" : tp.power >= 30 ? "text-purple-400" : ""
                }`}>
                  <span className={`truncate flex-1 ${tp.power >= 50 ? "text-yellow-300" : tp.power >= 30 ? "text-purple-300" : "text-gray-500"}`}>
                    {tp.trait}: {tp.value}
                  </span>
                  <span className={`font-mono font-bold ml-1 ${
                    tp.power >= 50 ? "text-yellow-400" : tp.power >= 30 ? "text-purple-400" : "text-green-400"
                  }`}>+{tp.power}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-2">
      {/* Fixed width container - same size for all phases */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-[400px] sm:w-[480px] p-4 relative overflow-hidden">
        
        {/* Title area - fixed height */}
        <div className="h-16 flex items-center justify-center mb-2">
          {phase === "countdown" && (
            <div className="text-center">
              <div className="text-gray-400 text-xs">Battle Starting In</div>
              <div className="text-6xl font-bold text-purple-400 animate-pulse leading-none">
                {countdown}
              </div>
            </div>
          )}
          {phase === "spinning" && (
            <h2 className="text-lg font-bold text-white">🎴 Drawing Cards...</h2>
          )}
          {phase === "cards-revealed" && (
            <h2 className="text-lg font-bold text-white">⚔️ Cards Drawn!</h2>
          )}
          {phase === "power-revealed" && (
            <h2 className="text-lg font-bold text-white">⚡ Analyzing Power...</h2>
          )}
          {(phase === "winner" || phase === "complete") && (
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">
                {isTie ? "🤝 It's a Tie!" : isCurrentUserWinner ? "🎉 Victory!" : isCurrentUserPlayer ? "😔 Defeat" : "👑 Battle Complete!"}
              </h2>
              <p className="text-sm text-gray-400">
                {isTie ? "Equal power - wagers refunded" : (
                  <>Winner takes <span className="text-green-400 font-bold">{winAmount} ETH</span></>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Cards container - always visible, same layout */}
        <div className="flex justify-center items-start gap-2 sm:gap-4 mb-3">
          <BattleCard
            label="Host"
            address={player1Address}
            tokenId={player1TokenId}
            image={player1Image}
            power={player1Power}
            traitPowers={player1TraitPowers}
            isWinner={isPlayer1Winner}
          />
          
          {/* VS */}
          <div className="flex items-center h-[160px] sm:h-[180px]">
            <div className={`text-lg font-bold transition-colors duration-300 ${
              showWinner ? "text-purple-400" : "text-gray-600"
            }`}>
              VS
            </div>
          </div>
          
          <BattleCard
            label="Challenger"
            address={player2Address}
            tokenId={player2TokenId}
            image={player2Image}
            power={player2Power}
            traitPowers={player2TraitPowers}
            isWinner={isPlayer2Winner}
          />
        </div>

        {/* Footer - pot + button */}
        <div className="text-center">
          <div className="text-gray-400 text-xs mb-2">
            Total Pot: <span className="text-white font-bold">{formatEther(wagerAmount * BigInt(2))} ETH</span>
          </div>

          {phase === "complete" ? (
            <button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-8 rounded-lg transition-colors"
            >
              Continue to Lobby
            </button>
          ) : (
            <div className="flex justify-center gap-1 h-9 items-center">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
