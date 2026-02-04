# 🪙 Re-Flip

A two-player coin flip wagering game built on Base blockchain.

## Features

- **Create Games** - Set your wager amount and wait for an opponent
- **Join Games** - Browse open games and join one that matches your stakes
- **Invite Friends** - Share a direct link to your game via social media or text
- **Fair Gameplay** - Random selection of who calls heads/tails
- **Rematch** - Play again with the same opponent, alternating who calls
- **Low Fees** - Only 1% platform fee, plus minimal Base gas costs (~$0.01)

## How It Works

1. **Create a Game**: Connect your wallet, set a wager amount, and create a game
2. **Wait or Share**: Wait for a random opponent or share your game link
3. **Flip**: Once an opponent joins, a random player is chosen to call heads or tails
4. **Win**: If the coin lands on your call, you win the pot minus 1% fee
5. **Rematch**: Both players can request a rematch - the caller alternates each round

## Project Structure

```
re-flip/
├── contracts/              # Smart contracts (Foundry)
│   ├── src/
│   │   └── CoinFlip.sol   # Main game contract
│   ├── test/
│   │   └── CoinFlip.t.sol # Contract tests
│   ├── script/
│   │   └── Deploy.s.sol   # Deployment script
│   └── foundry.toml       # Foundry config
├── frontend/              # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── lib/               # Utilities & contract ABI
└── documentation/         # Base.org documentation
```

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- A wallet with Base Sepolia ETH (get from [faucet](https://docs.base.org/base-chain/tools/network-faucets))

### 1. Deploy the Contract

```bash
cd contracts

# Copy environment file
cp .env.example .env
# Edit .env and add your private key

# Deploy to Base Sepolia
source .env
forge create ./src/CoinFlip.sol:CoinFlip \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --account deployer \
  --broadcast

# Note the deployed contract address!
```

### 2. Run the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local and add your contract address

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play!

## Smart Contract

### Key Functions

| Function | Description |
|----------|-------------|
| `createGame()` | Create a new game with ETH wager |
| `joinGame(gameId)` | Join an open game with matching wager |
| `callCoin(gameId, side)` | Call heads (1) or tails (2) |
| `cancelGame(gameId)` | Cancel an open game and refund |
| `requestRematch(gameId)` | Request a rematch after game ends |

### Game Status

- `0` - Open (waiting for opponent)
- `1` - Active (waiting for coin call)
- `2` - Flipping (coin called, resolving)
- `3` - Complete (game finished)
- `4` - Cancelled (game cancelled)

### Events

```solidity
event GameCreated(uint256 indexed gameId, address indexed creator, uint256 wagerAmount);
event GameJoined(uint256 indexed gameId, address indexed player2);
event CallerSelected(uint256 indexed gameId, address indexed caller);
event CoinCalled(uint256 indexed gameId, address indexed caller, CoinSide side);
event CoinFlipped(uint256 indexed gameId, CoinSide result, address indexed winner, uint256 payout);
```

## Testing

### Run Contract Tests

```bash
cd contracts
forge test -vv
```

All 28 tests should pass:
- Game creation and joining
- Coin calling and flipping
- Payout distribution (99% to winner, 1% fee)
- Game cancellation
- Rematch functionality
- Open games tracking

## Deployment

### Base Sepolia (Testnet)

```bash
forge create ./src/CoinFlip.sol:CoinFlip \
  --rpc-url https://sepolia.base.org \
  --account deployer \
  --broadcast
```

### Base Mainnet

```bash
forge create ./src/CoinFlip.sol:CoinFlip \
  --rpc-url https://mainnet.base.org \
  --account deployer \
  --broadcast
```

## Network Info

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Base Sepolia | 84532 | https://sepolia.base.org | https://sepolia.basescan.org |
| Base Mainnet | 8453 | https://mainnet.base.org | https://basescan.org |

## Security Considerations

⚠️ **Important**: This contract uses block-based randomness which is acceptable for low-stakes games but NOT suitable for high-value wagers. For production use with significant funds, consider:

- Chainlink VRF for verifiable randomness
- Commit-reveal schemes
- Additional security audits

## Tech Stack

- **Smart Contracts**: Solidity, Foundry
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: wagmi, viem, OnchainKit
- **Network**: Base (Ethereum L2)

## License

MIT

---

Built with ❤️ on Base
