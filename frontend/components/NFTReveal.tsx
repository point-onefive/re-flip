"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useNFTImage } from "@/hooks/useNFTImage";
import { TraitPower, getTokenPowerData, formatTraitName } from "@/lib/traitPowerData";

interface NFTRevealProps {
  collectionAddress: string;
  tokenId: number;
  playerLabel: string;
  isWinner: boolean;
  showResult: boolean;
  showWinner?: boolean; // When to reveal winner/loser styling (defaults to showResult)
  delay?: number; // Delay before revealing (for animation sequencing)
  showTraits?: boolean; // Whether to show trait breakdown
}

export function NFTReveal({
  collectionAddress,
  tokenId,
  playerLabel,
  isWinner,
  showResult,
  showWinner,
  delay = 0,
  showTraits = false,
}: NFTRevealProps) {
  const { imageUrl, metadata, isLoading } = useNFTImage(
    showResult ? collectionAddress : undefined,
    showResult ? tokenId : undefined
  );
  const [revealed, setRevealed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get power data for this token
  const powerData = getTokenPowerData(tokenId);

  // Winner styling only shows when explicitly told (defaults to when revealed)
  const showWinnerStyling = showWinner !== undefined ? showWinner : revealed;

  // Handle reveal timing
  useEffect(() => {
    if (showResult && imageUrl && imageLoaded) {
      const timer = setTimeout(() => {
        setRevealed(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [showResult, imageUrl, imageLoaded, delay]);

  // Reset when token changes
  useEffect(() => {
    setRevealed(false);
    setImageLoaded(false);
  }, [tokenId]);

  return (
    <div className="flex flex-col items-center">
      {/* Player label */}
      <div className="text-gray-400 text-sm mb-2">{playerLabel}</div>

      {/* NFT Card */}
      <div
        className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden border-4 transition-all duration-500 ${
          showWinnerStyling
            ? isWinner
              ? "border-green-500 shadow-lg shadow-green-500/50"
              : "border-red-500 shadow-lg shadow-red-500/30 opacity-70"
            : revealed
            ? "border-purple-500"
            : "border-gray-600"
        }`}
      >
        {/* Loading/unrevealed state - animated card back */}
        {(!showResult || isLoading || !imageLoaded || !revealed) && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
            {showResult && (isLoading || !imageLoaded) ? (
              // Loading spinner
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            ) : (
              // Card back pattern
              <div className="text-4xl animate-pulse">🎴</div>
            )}
          </div>
        )}

        {/* Actual NFT image (preloaded behind the card back) */}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={metadata?.name || `NFT #${tokenId}`}
            fill
            className={`object-cover transition-opacity duration-300 ${
              revealed && imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            unoptimized // External images
          />
        )}

        {/* Winner/Loser badge */}
        {showWinnerStyling && (
          <div
            className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
              isWinner ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {isWinner ? "👑" : "💀"}
          </div>
        )}
      </div>

      {/* Token ID */}
      <div
        className={`mt-2 font-bold text-lg transition-all duration-500 ${
          showWinnerStyling
            ? isWinner
              ? "text-green-400 text-xl"
              : "text-red-400"
            : revealed
            ? "text-white text-xl"
            : "text-gray-500"
        }`}
      >
        {revealed ? `#${tokenId}` : "???"}
      </div>

      {/* NFT Name (if available) */}
      {revealed && metadata?.name && (
        <div className="text-gray-400 text-xs mt-1 text-center max-w-32 truncate">
          {metadata.name}
        </div>
      )}

      {/* Power Level Badge */}
      {revealed && powerData && (
        <div className={`mt-2 px-3 py-1 rounded-full text-sm font-bold ${
          showWinnerStyling
            ? isWinner 
              ? 'bg-green-500/20 text-green-300 border border-green-500' 
              : 'bg-red-500/20 text-red-300 border border-red-500'
            : 'bg-purple-500/20 text-purple-300 border border-purple-500'
        }`}>
          ⚡ {powerData.totalPower}
        </div>
      )}
    </div>
  );
}

// Battle result modal with both NFTs
interface NFTBattleResultProps {
  show: boolean;
  onClose: () => void;
  collectionAddress: string;
  player1TokenId: number;
  player2TokenId: number;
  player1Power: number;
  player2Power: number;
  player1Label: string;
  player2Label: string;
  winnerTokenId: number;
  userWon: boolean;
  winAmount: string;
  lossAmount: string;
}

export function NFTBattleResult({
  show,
  onClose,
  collectionAddress,
  player1TokenId,
  player2TokenId,
  player1Power,
  player2Power,
  player1Label,
  player2Label,
  winnerTokenId,
  userWon,
  winAmount,
  lossAmount,
}: NFTBattleResultProps) {
  const [showCards, setShowCards] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Get power data for both tokens
  const player1PowerData = getTokenPowerData(player1TokenId);
  const player2PowerData = getTokenPowerData(player2TokenId);

  useEffect(() => {
    if (show) {
      // Sequence the reveal
      setShowCards(false);
      setShowResult(false);
      
      // Start showing cards after a brief delay
      const cardsTimer = setTimeout(() => setShowCards(true), 500);
      // Show result after cards have loaded - longer delay to let people see NFTs
      const resultTimer = setTimeout(() => setShowResult(true), 5000);
      
      return () => {
        clearTimeout(cardsTimer);
        clearTimeout(resultTimer);
      };
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-3xl p-6 sm:p-8 text-center w-full max-w-md border-4 transition-all duration-500 ${
          showResult
            ? userWon
              ? "bg-gradient-to-b from-green-900 to-green-950 border-green-500"
              : "bg-gradient-to-b from-red-900 to-red-950 border-red-500"
            : "bg-gradient-to-b from-gray-800 to-gray-900 border-gray-600"
        }`}
      >
        {/* Header */}
        <div className="text-2xl font-bold text-white mb-6">
          {showResult ? (userWon ? "🎉 YOU WON!" : "😢 YOU LOST") : "⚔️ BATTLE!"}
        </div>

        {/* NFT Cards side by side */}
        <div className="flex justify-center items-center gap-4 sm:gap-8 mb-6">
          <NFTReveal
            collectionAddress={collectionAddress}
            tokenId={player1TokenId}
            playerLabel={player1Label}
            isWinner={player1TokenId === winnerTokenId}
            showResult={showCards}
            showWinner={showResult}
            delay={0}
          />
          
          <div className="text-3xl font-black text-gray-500">VS</div>
          
          <NFTReveal
            collectionAddress={collectionAddress}
            tokenId={player2TokenId}
            playerLabel={player2Label}
            isWinner={player2TokenId === winnerTokenId}
            showResult={showCards}
            showWinner={showResult}
            delay={500} // Slight delay for dramatic effect
          />
        </div>

        {/* Result text */}
        {showResult && (
          <>
            {/* Power comparison */}
            <div className="text-gray-300 text-sm mb-3">
              Higher power wins!
            </div>
            
            {/* Trait breakdown panels */}
            <div className="flex gap-4 mb-4 text-left">
              {/* Player 1 traits */}
              <div className={`flex-1 p-2 rounded-lg ${
                player1TokenId === winnerTokenId 
                  ? 'bg-green-900/30 border border-green-500/50' 
                  : 'bg-red-900/30 border border-red-500/50'
              }`}>
                {player1PowerData ? (
                  <div className="text-xs space-y-0.5">
                    <div className={`font-semibold mb-1 ${
                      player1PowerData.gender === 'one-of-one' ? 'text-purple-400' :
                      player1PowerData.gender === 'female' ? 'text-pink-400' : 'text-blue-400'
                    }`}>
                      {player1PowerData.gender === 'one-of-one' ? '🃏 1/1' : 
                       player1PowerData.gender === 'female' ? '♀️ Female' : '♂️ Male'}
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-0.5 pr-2">
                      {[...player1PowerData.traitPowers]
                        .sort((a, b) => b.power - a.power)
                        .map((trait, idx) => (
                        <div key={idx} className="flex justify-between text-gray-300 gap-2">
                          <span className="truncate flex-1">{trait.value}</span>
                          <span className="text-yellow-400 font-mono shrink-0">+{trait.power}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`border-t mt-1 pt-1 flex justify-between font-bold ${
                      player1TokenId === winnerTokenId ? 'border-green-500 text-green-300' : 'border-red-500 text-red-300'
                    }`}>
                      <span>Total</span>
                      <span className="text-lg">⚡{player1PowerData.totalPower}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">⚡{player1Power}</div>
                )}
              </div>
              
              {/* Player 2 traits */}
              <div className={`flex-1 p-2 rounded-lg ${
                player2TokenId === winnerTokenId 
                  ? 'bg-green-900/30 border border-green-500/50' 
                  : 'bg-red-900/30 border border-red-500/50'
              }`}>
                {player2PowerData ? (
                  <div className="text-xs space-y-0.5">
                    <div className={`font-semibold mb-1 ${
                      player2PowerData.gender === 'one-of-one' ? 'text-purple-400' :
                      player2PowerData.gender === 'female' ? 'text-pink-400' : 'text-blue-400'
                    }`}>
                      {player2PowerData.gender === 'one-of-one' ? '🃏 1/1' : 
                       player2PowerData.gender === 'female' ? '♀️ Female' : '♂️ Male'}
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-0.5 pr-2">
                      {[...player2PowerData.traitPowers]
                        .sort((a, b) => b.power - a.power)
                        .map((trait, idx) => (
                        <div key={idx} className="flex justify-between text-gray-300 gap-2">
                          <span className="truncate flex-1">{trait.value}</span>
                          <span className="text-yellow-400 font-mono shrink-0">+{trait.power}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`border-t mt-1 pt-1 flex justify-between font-bold ${
                      player2TokenId === winnerTokenId ? 'border-green-500 text-green-300' : 'border-red-500 text-red-300'
                    }`}>
                      <span>Total</span>
                      <span className="text-lg">⚡{player2PowerData.totalPower}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">⚡{player2Power}</div>
                )}
              </div>
            </div>

            <div
              className={`text-2xl sm:text-3xl font-bold mb-6 ${
                userWon ? "text-green-300" : "text-red-300"
              }`}
            >
              {userWon ? `+${winAmount} ETH` : `-${lossAmount} ETH`}
            </div>
          </>
        )}

        {/* Close button */}
        {showResult && (
          <button
            onClick={onClose}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-colors ${
              userWon
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            {userWon ? "🎊 Awesome!" : "Try Again"}
          </button>
        )}

        {/* Loading indicator when not showing result yet */}
        {!showResult && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}
