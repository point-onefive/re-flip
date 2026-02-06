export const nftBattleABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "accumulatedFees",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addCollection",
    inputs: [
      { name: "_collection", type: "address", internalType: "address" },
      { name: "_name", type: "string", internalType: "string" },
      { name: "_totalSupply", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelGame",
    inputs: [{ name: "_gameId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelRematchRequest",
    inputs: [{ name: "_gameId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "collectionList",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "collections",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [
      { name: "deckSize", type: "uint256", internalType: "uint256" },
      { name: "name", type: "string", internalType: "string" },
      { name: "active", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createGame",
    inputs: [{ name: "_collection", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "draw",
    inputs: [{ name: "_gameId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "feePercent",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "gameCounter",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "games",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "id", type: "uint256", internalType: "uint256" },
      { name: "player1", type: "address", internalType: "address" },
      { name: "player2", type: "address", internalType: "address" },
      { name: "collection", type: "address", internalType: "address" },
      { name: "wagerAmount", type: "uint256", internalType: "uint256" },
      { name: "status", type: "uint8", internalType: "enum NFTBattle.GameStatus" },
      { name: "currentDrawer", type: "address", internalType: "address" },
      { name: "player1TokenId", type: "uint256", internalType: "uint256" },
      { name: "player2TokenId", type: "uint256", internalType: "uint256" },
      { name: "player1Power", type: "uint256", internalType: "uint256" },
      { name: "player2Power", type: "uint256", internalType: "uint256" },
      { name: "winner", type: "address", internalType: "address" },
      { name: "roundNumber", type: "uint256", internalType: "uint256" },
      { name: "createdAt", type: "uint256", internalType: "uint256" },
      { name: "completedAt", type: "uint256", internalType: "uint256" },
      { name: "player1WantsRematch", type: "bool", internalType: "bool" },
      { name: "player2WantsRematch", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCollections",
    inputs: [],
    outputs: [
      { name: "", type: "address[]", internalType: "address[]" },
      {
        name: "",
        type: "tuple[]",
        internalType: "struct NFTBattle.Collection[]",
        components: [
          { name: "totalSupply", type: "uint256", internalType: "uint256" },
          { name: "name", type: "string", internalType: "string" },
          { name: "active", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getGame",
    inputs: [{ name: "_gameId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct NFTBattle.Game",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "player1", type: "address", internalType: "address" },
          { name: "player2", type: "address", internalType: "address" },
          { name: "collection", type: "address", internalType: "address" },
          { name: "wagerAmount", type: "uint256", internalType: "uint256" },
          { name: "status", type: "uint8", internalType: "enum NFTBattle.GameStatus" },
          { name: "currentDrawer", type: "address", internalType: "address" },
          { name: "player1TokenId", type: "uint256", internalType: "uint256" },
          { name: "player2TokenId", type: "uint256", internalType: "uint256" },
          { name: "player1Power", type: "uint256", internalType: "uint256" },
          { name: "player2Power", type: "uint256", internalType: "uint256" },
          { name: "winner", type: "address", internalType: "address" },
          { name: "roundNumber", type: "uint256", internalType: "uint256" },
          { name: "createdAt", type: "uint256", internalType: "uint256" },
          { name: "completedAt", type: "uint256", internalType: "uint256" },
          { name: "player1WantsRematch", type: "bool", internalType: "bool" },
          { name: "player2WantsRematch", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getOpenGames",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct NFTBattle.Game[]",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "player1", type: "address", internalType: "address" },
          { name: "player2", type: "address", internalType: "address" },
          { name: "collection", type: "address", internalType: "address" },
          { name: "wagerAmount", type: "uint256", internalType: "uint256" },
          { name: "status", type: "uint8", internalType: "enum NFTBattle.GameStatus" },
          { name: "currentDrawer", type: "address", internalType: "address" },
          { name: "player1TokenId", type: "uint256", internalType: "uint256" },
          { name: "player2TokenId", type: "uint256", internalType: "uint256" },
          { name: "player1Power", type: "uint256", internalType: "uint256" },
          { name: "player2Power", type: "uint256", internalType: "uint256" },
          { name: "winner", type: "address", internalType: "address" },
          { name: "roundNumber", type: "uint256", internalType: "uint256" },
          { name: "createdAt", type: "uint256", internalType: "uint256" },
          { name: "completedAt", type: "uint256", internalType: "uint256" },
          { name: "player1WantsRematch", type: "bool", internalType: "bool" },
          { name: "player2WantsRematch", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPlayerGames",
    inputs: [{ name: "_player", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct NFTBattle.Game[]",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "player1", type: "address", internalType: "address" },
          { name: "player2", type: "address", internalType: "address" },
          { name: "collection", type: "address", internalType: "address" },
          { name: "wagerAmount", type: "uint256", internalType: "uint256" },
          { name: "status", type: "uint8", internalType: "enum NFTBattle.GameStatus" },
          { name: "currentDrawer", type: "address", internalType: "address" },
          { name: "player1TokenId", type: "uint256", internalType: "uint256" },
          { name: "player2TokenId", type: "uint256", internalType: "uint256" },
          { name: "player1Power", type: "uint256", internalType: "uint256" },
          { name: "player2Power", type: "uint256", internalType: "uint256" },
          { name: "winner", type: "address", internalType: "address" },
          { name: "roundNumber", type: "uint256", internalType: "uint256" },
          { name: "createdAt", type: "uint256", internalType: "uint256" },
          { name: "completedAt", type: "uint256", internalType: "uint256" },
          { name: "player1WantsRematch", type: "bool", internalType: "bool" },
          { name: "player2WantsRematch", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "joinGame",
    inputs: [{ name: "_gameId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "requestRematch",
    inputs: [{ name: "_gameId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "setCollectionActive",
    inputs: [
      { name: "_collection", type: "address", internalType: "address" },
      { name: "_active", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFeePercent",
    inputs: [{ name: "_feePercent", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "_newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawFees",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "CollectionAdded",
    inputs: [
      { name: "collection", type: "address", indexed: true, internalType: "address" },
      { name: "name", type: "string", indexed: false, internalType: "string" },
      { name: "totalSupply", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CollectionUpdated",
    inputs: [
      { name: "collection", type: "address", indexed: true, internalType: "address" },
      { name: "active", type: "bool", indexed: false, internalType: "bool" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DrawInitiated",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "drawer", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FeesWithdrawn",
    inputs: [
      { name: "owner", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "GameCancelled",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "GameComplete",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "winner", type: "address", indexed: true, internalType: "address" },
      { name: "player1TokenId", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "player1Power", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "player2TokenId", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "player2Power", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "winnings", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "GameCreated",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "player1", type: "address", indexed: true, internalType: "address" },
      { name: "collection", type: "address", indexed: true, internalType: "address" },
      { name: "wagerAmount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "GameJoined",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "player2", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RematchCreated",
    inputs: [
      { name: "oldGameId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "newGameId", type: "uint256", indexed: true, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RematchRequested",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "player", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
] as const;

// Game status enum
export enum BattleGameStatus {
  Open = 0,
  Active = 1,
  Drawing = 2,
  Complete = 3,
  Cancelled = 4,
}

// Collection type
export interface Collection {
  deckSize: bigint;
  name: string;
  active: boolean;
}

// Game type
export interface BattleGame {
  id: bigint;
  player1: `0x${string}`;
  player2: `0x${string}`;
  collection: `0x${string}`;
  wagerAmount: bigint;
  status: number;
  currentDrawer: `0x${string}`;
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
}

// NFT Metadata type
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

// Known collections with their tokenURI patterns
export const KNOWN_COLLECTIONS: Record<string, {
  name: string;
  getTokenURI: (tokenId: number) => string;
}> = {
  "0x56dFE6ae26bf3043DC8Fdf33bF739B4fF4B3BC4A": {
    name: "re:generates",
    getTokenURI: (tokenId: number) => 
      `https://app.bueno.art/api/contract/JLK3PYMUlbiFqxCjWTj1F/chain/8453/metadata/${tokenId}`,
  },
};

// Contract address (will be set after deployment)
export const NFT_BATTLE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_BATTLE_CONTRACT_ADDRESS as `0x${string}`;
