import nftBattleV2Abi from "./nftBattleV2Abi.json";

// Re-export the ABI
export { nftBattleV2Abi };

// Contract address - update after deployment
export const NFT_BATTLE_V2_ADDRESS = process.env.NEXT_PUBLIC_NFT_BATTLE_V2_ADDRESS as `0x${string}` || "0x0000000000000000000000000000000000000000";

// Game Status enum matching the contract
export enum GameStatus {
  Open = 0,
  WaitingVRF = 1,
  Complete = 2,
  Cancelled = 3,
}

// Game struct matching the contract
export interface GameV2 {
  id: bigint;
  player1: `0x${string}`;
  player2: `0x${string}`;
  deckId: bigint;
  wagerAmount: bigint;
  status: GameStatus;
  player1TokenId: bigint;
  player2TokenId: bigint;
  player1Power: bigint;
  player2Power: bigint;
  winner: `0x${string}`;
  roundNumber: bigint;
  createdAt: bigint;
  completedAt: bigint;
  player1WantsRematch: boolean;
  player2WantsRematch: boolean;
  usedVRF: boolean;
  vrfRequestId: bigint;
}

// Deck struct matching the contract
export interface Deck {
  collection: `0x${string}`;
  name: string;
  version: bigint;
  active: boolean;
  cardCount: bigint;
}

// Leaderboard entry
export interface LeaderboardEntry {
  player: `0x${string}`;
  wins: bigint;
  gamesPlayed: bigint;
}

// Epoch info
export interface EpochInfo {
  currentEpoch: bigint;
  epochEndTime: bigint;
  minWagerForPoints: bigint;
  bonusMultiplier: bigint;
}

// Player stats
export interface PlayerStats {
  wins: bigint;
  gamesPlayed: bigint;
}

// Helper to format game status
export function formatGameStatus(status: GameStatus): string {
  switch (status) {
    case GameStatus.Open:
      return "Waiting for opponent";
    case GameStatus.WaitingVRF:
      return "Awaiting randomness...";
    case GameStatus.Complete:
      return "Complete";
    case GameStatus.Cancelled:
      return "Cancelled";
    default:
      return "Unknown";
  }
}

// Helper to check if game is joinable
export function isGameJoinable(game: GameV2, userAddress?: string): boolean {
  return (
    game.status === GameStatus.Open &&
    game.player1.toLowerCase() !== userAddress?.toLowerCase()
  );
}

// Helper to check if user can request rematch
export function canRequestRematch(game: GameV2, userAddress?: string): boolean {
  if (game.status !== GameStatus.Complete || !userAddress) return false;
  
  const isPlayer1 = game.player1.toLowerCase() === userAddress.toLowerCase();
  const isPlayer2 = game.player2.toLowerCase() === userAddress.toLowerCase();
  
  if (isPlayer1) return !game.player1WantsRematch;
  if (isPlayer2) return !game.player2WantsRematch;
  
  return false;
}

// Helper to format wager amount
export function formatWager(wagerAmount: bigint): string {
  const eth = Number(wagerAmount) / 1e18;
  if (eth >= 1) return `${eth.toFixed(2)} ETH`;
  if (eth >= 0.01) return `${eth.toFixed(3)} ETH`;
  return `${eth.toFixed(4)} ETH`;
}

// Helper to format time remaining
export function formatTimeRemaining(endTime: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const remaining = Number(endTime - now);
  
  if (remaining <= 0) return "Ended";
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
