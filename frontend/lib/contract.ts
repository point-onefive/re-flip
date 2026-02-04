export const coinFlipABI = [
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
    name: "FEE_DENOMINATOR",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "FEE_PERCENTAGE",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "callCoin",
    inputs: [
      { name: "_gameId", type: "uint256", internalType: "uint256" },
      { name: "_side", type: "uint8", internalType: "enum CoinFlip.CoinSide" },
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
    name: "collectedFees",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createGame",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "payable",
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
      { name: "wagerAmount", type: "uint256", internalType: "uint256" },
      { name: "status", type: "uint8", internalType: "enum CoinFlip.GameStatus" },
      { name: "currentCaller", type: "address", internalType: "address" },
      { name: "calledSide", type: "uint8", internalType: "enum CoinFlip.CoinSide" },
      { name: "result", type: "uint8", internalType: "enum CoinFlip.CoinSide" },
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
    name: "getGame",
    inputs: [{ name: "_gameId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct CoinFlip.Game",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "player1", type: "address", internalType: "address" },
          { name: "player2", type: "address", internalType: "address" },
          { name: "wagerAmount", type: "uint256", internalType: "uint256" },
          { name: "status", type: "uint8", internalType: "enum CoinFlip.GameStatus" },
          { name: "currentCaller", type: "address", internalType: "address" },
          { name: "calledSide", type: "uint8", internalType: "enum CoinFlip.CoinSide" },
          { name: "result", type: "uint8", internalType: "enum CoinFlip.CoinSide" },
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
    name: "getGamesByIds",
    inputs: [{ name: "_gameIds", type: "uint256[]", internalType: "uint256[]" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct CoinFlip.Game[]",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "player1", type: "address", internalType: "address" },
          { name: "player2", type: "address", internalType: "address" },
          { name: "wagerAmount", type: "uint256", internalType: "uint256" },
          { name: "status", type: "uint8", internalType: "enum CoinFlip.GameStatus" },
          { name: "currentCaller", type: "address", internalType: "address" },
          { name: "calledSide", type: "uint8", internalType: "enum CoinFlip.CoinSide" },
          { name: "result", type: "uint8", internalType: "enum CoinFlip.CoinSide" },
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
    inputs: [
      { name: "_offset", type: "uint256", internalType: "uint256" },
      { name: "_limit", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct CoinFlip.Game[]",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "player1", type: "address", internalType: "address" },
          { name: "player2", type: "address", internalType: "address" },
          { name: "wagerAmount", type: "uint256", internalType: "uint256" },
          { name: "status", type: "uint8", internalType: "enum CoinFlip.GameStatus" },
          { name: "currentCaller", type: "address", internalType: "address" },
          { name: "calledSide", type: "uint8", internalType: "enum CoinFlip.CoinSide" },
          { name: "result", type: "uint8", internalType: "enum CoinFlip.CoinSide" },
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
    name: "getOpenGamesCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserGames",
    inputs: [{ name: "_user", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
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
    name: "openGameIds",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
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
    name: "transferOwnership",
    inputs: [{ name: "_newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "userGames",
    inputs: [
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
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
    name: "CallerSelected",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "caller", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CoinCalled",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "caller", type: "address", indexed: true, internalType: "address" },
      { name: "side", type: "uint8", indexed: false, internalType: "enum CoinFlip.CoinSide" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CoinFlipped",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "result", type: "uint8", indexed: false, internalType: "enum CoinFlip.CoinSide" },
      { name: "winner", type: "address", indexed: true, internalType: "address" },
      { name: "payout", type: "uint256", indexed: false, internalType: "uint256" },
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
    inputs: [{ name: "gameId", type: "uint256", indexed: true, internalType: "uint256" }],
    anonymous: false,
  },
  {
    type: "event",
    name: "GameCreated",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "creator", type: "address", indexed: true, internalType: "address" },
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
    name: "RematchRequested",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "player", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RematchStarted",
    inputs: [
      { name: "oldGameId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "newGameId", type: "uint256", indexed: true, internalType: "uint256" },
    ],
    anonymous: false,
  },
  { type: "error", name: "AlreadyCalled", inputs: [] },
  { type: "error", name: "CannotJoinOwnGame", inputs: [] },
  { type: "error", name: "GameAlreadyFull", inputs: [] },
  { type: "error", name: "GameNotActive", inputs: [] },
  { type: "error", name: "GameNotComplete", inputs: [] },
  { type: "error", name: "GameNotFound", inputs: [] },
  { type: "error", name: "GameNotOpen", inputs: [] },
  { type: "error", name: "InsufficientBalance", inputs: [] },
  { type: "error", name: "InvalidWagerAmount", inputs: [] },
  { type: "error", name: "NotAPlayer", inputs: [] },
  { type: "error", name: "NotYourTurn", inputs: [] },
  { type: "error", name: "RematchAlreadyRequested", inputs: [] },
  { type: "error", name: "RematchNotRequested", inputs: [] },
  { type: "error", name: "TransferFailed", inputs: [] },
  { type: "error", name: "WagerMismatch", inputs: [] },
] as const;

// Game Status enum
export enum GameStatus {
  Open = 0,
  Active = 1,
  Flipping = 2,
  Complete = 3,
  Cancelled = 4,
}

// Coin Side enum
export enum CoinSide {
  None = 0,
  Heads = 1,
  Tails = 2,
}

// Game type for TypeScript
export interface Game {
  id: bigint;
  player1: `0x${string}`;
  player2: `0x${string}`;
  wagerAmount: bigint;
  status: GameStatus;
  currentCaller: `0x${string}`;
  calledSide: CoinSide;
  result: CoinSide;
  winner: `0x${string}`;
  roundNumber: bigint;
  createdAt: bigint;
  completedAt: bigint;
  player1WantsRematch: boolean;
  player2WantsRematch: boolean;
}

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
