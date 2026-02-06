/**
 * Trait Power Data Loader
 * Loads trait power breakdowns from the deck data
 */

import deckData from '@/data/decks/re_generates.json';

export interface TraitPower {
  trait: string;
  value: string;
  power: number;
}

export interface NFTPowerData {
  tokenId: number;
  totalPower: number;
  gender: 'male' | 'female' | 'one-of-one';
  traitPowers: TraitPower[];
}

// Build a map of tokenId -> power data for quick lookup
const powerDataMap = new Map<number, NFTPowerData>();

// Initialize the map from deck data
(deckData.deck as NFTPowerData[]).forEach((nft) => {
  powerDataMap.set(nft.tokenId, {
    tokenId: nft.tokenId,
    totalPower: nft.totalPower,
    gender: nft.gender,
    traitPowers: nft.traitPowers,
  });
});

/**
 * Get power data for a specific token ID
 * Returns null if the token is not in our deck
 */
export function getTokenPowerData(tokenId: number): NFTPowerData | null {
  return powerDataMap.get(tokenId) || null;
}

/**
 * Check if a token is in our deck
 */
export function isTokenInDeck(tokenId: number): boolean {
  return powerDataMap.has(tokenId);
}

/**
 * Get all deck stats
 */
export function getDeckStats() {
  return {
    deckSize: deckData.deckSize,
    powerRange: deckData.powerRange,
    stats: deckData.stats,
  };
}

/**
 * Format trait name for display (remove underscores, capitalize)
 */
export function formatTraitName(trait: string): string {
  // Remove leading underscore (female trait indicator)
  const cleaned = trait.startsWith('_') ? trait.slice(1) : trait;
  // Capitalize first letter of each word
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
