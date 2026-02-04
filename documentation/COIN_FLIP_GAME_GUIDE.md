# Base Coin Flip Game - Development Guide

> **Project:** Re-Flip - A two-player coin flip wagering game on Base
> **Generated:** February 4, 2026
> **Based on:** 71 pages of Base documentation

---

## 📋 Table of Contents

1. [Quick Start Checklist](#quick-start-checklist)
2. [Base Network Overview](#base-network-overview)
3. [Development Environment Setup](#development-environment-setup)
4. [Smart Contract Deployment](#smart-contract-deployment)
5. [Network Configuration](#network-configuration)
6. [Fees & Cost Optimization](#fees--cost-optimization)
7. [Key Tools & Services](#key-tools--services)
8. [Frontend Integration](#frontend-integration)
9. [Game Architecture Recommendations](#game-architecture-recommendations)
10. [Funding & Resources](#funding--resources)

---

## ✅ Quick Start Checklist

- [ ] Install Foundry (smart contract development framework)
- [ ] Get testnet ETH from Base Sepolia faucet
- [ ] Set up wallet with private key secured in keystore
- [ ] Deploy to Base Sepolia testnet first
- [ ] Test thoroughly before mainnet deployment
- [ ] Use OnchainKit for frontend wallet integration

---

## 🔷 Base Network Overview

### What is Base?
- **Ethereum L2** - Layer 2 built on Optimism's OP Stack
- **Low cost** - Significantly cheaper than Ethereum mainnet
- **Fast** - Quick transaction finality
- **EVM Compatible** - Use standard Solidity contracts
- **Backed by Coinbase** - Strong ecosystem support

### Why Base for Your Coin Flip Game?
1. **Low fees** - Critical for small wagers (your 1% fee needs to be > gas costs)
2. **Fast finality** - Good UX for real-time gaming
3. **Large user base** - Coinbase ecosystem users
4. **Easy onboarding** - Coinbase wallet integration

---

## 🛠 Development Environment Setup

### 1. Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Create Project
```bash
mkdir coin-flip-game && cd coin-flip-game
forge init
```

### 3. Project Structure (Recommended)
```
coin-flip-game/
├── src/
│   └── CoinFlip.sol          # Main game contract
├── test/
│   └── CoinFlip.t.sol        # Contract tests
├── script/
│   └── Deploy.s.sol          # Deployment script
├── frontend/                  # React/Next.js frontend
├── .env                       # Environment variables (gitignored!)
└── foundry.toml              # Foundry config
```

### 4. Environment Variables (.env)
```bash
# DO NOT COMMIT THIS FILE
BASE_RPC_URL="https://mainnet.base.org"
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
CONTRACT_ADDRESS="0x..."
```

### 5. Secure Your Private Key
```bash
# Store in Foundry's secure keystore (NOT in .env!)
cast wallet import deployer --interactive
```

---

## 🚀 Smart Contract Deployment

### Deploy to Base Sepolia (Testnet) - DO THIS FIRST
```bash
source .env

# Dry run (simulation)
forge create ./src/CoinFlip.sol:CoinFlip --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer

# Actual deployment
forge create ./src/CoinFlip.sol:CoinFlip --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer --broadcast
```

### Deploy to Base Mainnet (Production)
```bash
forge create ./src/CoinFlip.sol:CoinFlip --rpc-url $BASE_RPC_URL --account deployer --broadcast
```

### Verify Deployment
```bash
# Check on Basescan
# Sepolia: https://sepolia.basescan.org/
# Mainnet: https://basescan.org/

# Or via command line
cast call $CONTRACT_ADDRESS "someFunction()(returnType)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

---

## 🌐 Network Configuration

### Base Mainnet
| Property | Value |
|----------|-------|
| Network Name | Base |
| RPC URL | https://mainnet.base.org |
| Chain ID | 8453 |
| Currency Symbol | ETH |
| Block Explorer | https://basescan.org |

### Base Sepolia (Testnet)
| Property | Value |
|----------|-------|
| Network Name | Base Sepolia |
| RPC URL | https://sepolia.base.org |
| Chain ID | 84532 |
| Currency Symbol | ETH |
| Block Explorer | https://sepolia.basescan.org |

### Get Testnet ETH
- **Faucets:** https://docs.base.org/base-chain/tools/network-faucets
- Coinbase Wallet has built-in faucet access

---

## 💰 Fees & Cost Optimization

### Fee Structure
Base transactions have **two components**:
1. **L2 Execution Fee** - Cost to execute on Base
2. **L1 Security Fee** - Cost to publish to Ethereum (usually higher)

### Current Minimum Base Fee
| Network | Minimum Base Fee |
|---------|------------------|
| Base Mainnet | 0.002 gwei |
| Base Sepolia | 0.0002 gwei |

### Cost Estimate
- ~$0.001 for typical 200,000 gas transaction (at $2500 ETH)
- Your 1% fee model works well with Base's low costs!

### Cost Optimization Tips
1. **Batch operations** when possible
2. **Deploy on weekends** for lower L1 fees
3. **Use efficient Solidity patterns** (mappings vs arrays)
4. **Minimize storage writes** (most expensive operation)

---

## 🧰 Key Tools & Services

### Smart Contract Development
- **Foundry** - Recommended (Forge, Cast, Anvil)
- **Hardhat** - Alternative option
- **Thirdweb** - Simplified deployment

### Frontend / Wallet Integration
- **OnchainKit** - React components for Base (RECOMMENDED)
  - Wallet connection
  - Transaction handling
  - Ready-to-use UI components
- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript library for Ethereum

### Block Explorers
- Mainnet: https://basescan.org
- Sepolia: https://sepolia.basescan.org

### Oracles (for randomness)
- **Chainlink VRF** - Verifiable random function
- **API3 QRNG** - Quantum random number generator
⚠️ **CRITICAL for your game:** You need provably fair randomness!

### Node Providers (if not using public RPC)
- Alchemy
- Infura
- QuickNode
- Coinbase Cloud

---

## 🖥 Frontend Integration

### Using OnchainKit (Recommended)
```bash
npm install @coinbase/onchainkit
```

Key features for your game:
- `ConnectWallet` component
- `Transaction` component for sending transactions
- `Identity` component for user profiles
- Built-in Base chain support

### Wallet Connection Flow
1. User connects wallet (OnchainKit handles this)
2. Check if on Base network, prompt switch if not
3. Allow game interactions

---

## 🎮 Game Architecture Recommendations

### For Your Coin Flip Game

#### Smart Contract Features Needed:
```solidity
// Key functions to implement
- createGame(uint256 wagerAmount) → returns gameId
- joinGame(uint256 gameId) payable
- flipCoin(uint256 gameId, bool callerChoice) → heads=true, tails=false
- playAgain(uint256 gameId) payable
- withdrawFees() onlyOwner

// Key storage
- mapping(uint256 => Game) public games
- mapping(address => uint256[]) public userGames
- uint256 public feePercentage = 1; // 1%

// Game struct
struct Game {
    address player1;
    address player2;
    uint256 wagerAmount;
    bool isActive;
    bool isOpen; // for public games
    address currentCaller;
    address winner;
    uint256 roundNumber;
}
```

#### Randomness Considerations:
⚠️ **IMPORTANT:** Block-based randomness is NOT secure for gambling!
- Use Chainlink VRF or API3 QRNG for provably fair coin flips
- Or use commit-reveal scheme

#### Social Sharing:
- Generate shareable game links: `yourapp.com/game/{gameId}`
- When clicked, link directs to join that specific game

#### Fee Collection:
```solidity
// On game completion
uint256 fee = (wagerAmount * 2 * feePercentage) / 100;
uint256 winnings = (wagerAmount * 2) - fee;
payable(winner).transfer(winnings);
// Fee stays in contract, withdrawable by owner
```

---

## 💵 Funding & Resources

### Get Funded for Your Project
- **Builder Rewards** - https://docs.base.org/get-started/get-funded
- **Grants** - Base ecosystem grants
- **Base Batches** - Accelerator program
- **Retroactive Funding** - For successful projects

### Builder Support
- **Base Services Hub** - Central resource hub
- **Mentorship Program** - Get a Base mentor
- **Discord** - Community support

### Useful Links from Documentation
- Deploy Guide: https://docs.base.org/base-chain/quickstart/deploy-on-base
- Network Fees: https://docs.base.org/base-chain/network-information/network-fees
- Faucets: https://docs.base.org/base-chain/tools/network-faucets
- OnchainKit: https://onchainkit.com/
- Foundry Book: https://book.getfoundry.sh/

---

## 📁 Documentation Reference

All scraped documentation is available in:
```
documentation/scraped_content/
├── _MASTER_DOCUMENTATION.md    # Combined docs
├── _summary.json               # Index of all pages
├── base-chain_quickstart_*.md  # Deployment guides
├── base-chain_network-*.md     # Network info
├── base-chain_tools_*.md       # Tools & services
└── ... (71 total files)
```

---

## 🚦 Recommended Development Order

1. **Week 1: Setup & Contract**
   - Set up Foundry environment
   - Write CoinFlip.sol smart contract
   - Write comprehensive tests
   - Deploy to Base Sepolia

2. **Week 2: Frontend**
   - Create Next.js/React app
   - Integrate OnchainKit for wallet
   - Build game UI (create, join, play)
   - Connect to testnet contract

3. **Week 3: Polish & Deploy**
   - Add social sharing features
   - Implement game listing/filtering
   - Security audit (basic)
   - Deploy to mainnet

4. **Ongoing: Iterate**
   - Gather user feedback
   - Add features (leaderboards, stats)
   - Apply for Base grants

---

*Good luck building Re-Flip! 🪙*
