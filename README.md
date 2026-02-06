# 🎴 Re-Flip: NFT Battle

A PvP wagering game on Base blockchain where players battle using NFT-powered cards. Each card's strength is derived from trait rarity, creating a skill-based meta around collection knowledge while maintaining random card selection for fairness.

---

## 📋 Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Platform Fee](#platform-fee)
- [Project Architecture](#project-architecture)
- [Current State (V2)](#current-state-v2)
- [Technical Specifications](#technical-specifications)
- [Contract Addresses](#contract-addresses)
- [Development Wallets](#development-wallets)
- [Local Development](#local-development)
- [Scripts Reference](#scripts-reference)
- [Admin Operations](#admin-operations)
- [Deck Explorer](#deck-explorer)
- [Image & Metadata Caching](#image--metadata-caching)
- [Design Decisions](#design-decisions)
- [AI/Copilot Quick Reference](#aicopilot-quick-reference)

---

## Overview

Re-Flip NFT Battle is a simple, fast, and transparent wagering game where:

1. **Players create or join games** with ETH wagers
2. **Each player receives a randomly drawn card** from a curated deck
3. **Higher power wins** - Power is calculated from trait rarity
4. **Winner takes the pot** minus a 2.5% platform fee
5. **Rematch instantly** - Both players can request a rematch without leaving

**Core Value Proposition:**
- 🎯 **Simple mechanics** - Easy to understand, hard to master
- ⚡ **Instant execution** - Games resolve immediately on join
- 🔍 **Transparent** - All randomness and power calculations are on-chain
- 💰 **Low fees** - 2.5% platform fee, minimal gas on Base (~$0.01)
- 🎨 **NFT-powered** - Leverage existing collections, no new NFTs needed

---

## How It Works

### Game Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  CREATE GAME    │    │   JOIN GAME     │    │  AUTO-EXECUTE   │
│                 │    │                 │    │                 │
│ - Choose wager  │───▶│ - Match wager   │───▶│ - Draw cards    │
│ - Pick collection    │ - Confirm join   │    │ - Compare power │
│ - Wait for P2   │    │                 │    │ - Pay winner    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                              ┌───────────────────────┘
                              ▼
┌─────────────────┐    ┌─────────────────┐
│    REMATCH      │◀───│  GAME COMPLETE  │
│                 │    │                 │
│ - Request again │    │ - View results  │
│ - Same wager    │    │ - See power lvls│
│ - Both accept   │    │ - Winner paid   │
└─────────────────┘    └─────────────────┘
```

### Power Level Calculation (Percentile-Based v3)

Power levels are assigned using a **percentile-based ranking system** that guarantees consistent power distributions across ALL collections, enabling fair cross-collection battles.

#### The Algorithm

```
1. Calculate raw rarity score for each NFT:
   RawScore = Σ (1 / trait_rarity_within_gender) for each trait
   
2. Rank all NFTs by raw score (highest = rarest = rank 0)

3. Convert rank to percentile:
   Percentile = rank / (deck_size - 1)
   
4. Map percentile to power (100-999 range):
   Power = 999 - (percentile × 899)
```

#### Why Percentile-Based?

| Old System (Raw Rarity) | New System (Percentile) |
|-------------------------|-------------------------|
| Power varies by collection (50-500 vs 10-100) | Always 100-999 for ALL collections |
| More traits = higher variance | Trait count doesn't affect range |
| 1/1s could break the scale | 1/1s = rank 0 = power 999 |
| Cross-collection unfair | Cross-collection battles fair |

#### Power Tier Distribution

Every deck has the SAME tier distribution:

| Tier | Power Range | % of Deck | Description |
|------|-------------|-----------|-------------|
| **LEGENDARY** | 950-999 | ~2% | Trump cards |
| **EPIC** | 850-949 | ~8% | Very strong |
| **RARE** | 700-849 | ~15% | Above average |
| **UNCOMMON** | 500-699 | ~25% | Solid middle |
| **COMMON** | 300-499 | ~25% | Below average |
| **BASIC** | 100-299 | ~25% | Most common |

#### Cross-Collection Compatibility

```
Collection A (200 cards, 8 traits):
  Rarest card: Rank 0 → Power 999
  Median card: Rank 100 → Power 550
  Most common: Rank 199 → Power 100

Collection B (500 cards, 4 traits):
  Rarest card: Rank 0 → Power 999
  Median card: Rank 250 → Power 550
  Most common: Rank 499 → Power 100

= SAME SCALE. FAIR BATTLES.
```

#### Special Cases

- **1/1s (Artist Pieces):** Automatically get rank 0 → power 999
- **Gender Normalization:** Male/female traits calculated within their population, then unified
- **Deck Updates:** New deck version = recalculated ranks (old games use old deck)

### Card Selection (Randomness)

**Current V1 Implementation:**
```solidity
uint256 randomSeed = uint256(keccak256(abi.encodePacked(
    block.timestamp,
    block.prevrandao,
    player1,
    player2,
    gameId
)));
```

This is pseudo-random using block data. Suitable for casual wagers but technically exploitable by sophisticated validators.

**V2 Implementation (Planned):**
- Games ≥ 0.02 ETH (~$50) will use **Chainlink VRF** for provably fair randomness
- Games below threshold continue with pseudo-random (instant execution)
- ~2 block delay for VRF games (~4 seconds on Base)

---

## Platform Fee

| Metric | Value |
|--------|-------|
| **Platform Fee** | 2.5% of total pot |
| **Applied When** | Game completes (winner payout) |
| **Not Applied** | Game cancellation, rematch cancellation |

**Example:**
- Player 1 wagers: 0.1 ETH
- Player 2 wagers: 0.1 ETH
- Total pot: 0.2 ETH
- Platform fee (2.5%): 0.005 ETH
- Winner receives: 0.195 ETH

**Fee Justification:**
- Industry standard (OpenSea 2.5%, casinos 2-5%)
- Covers infrastructure, VRF costs on high-value games
- Sustainable for leaderboard prizes and operations

---

## Project Architecture

```
re-flip/
├── contracts/                    # Smart contracts (Foundry)
│   └── src/
│       ├── CoinFlip.sol         # Legacy coin flip game (deprecated)
│       ├── NFTBattle.sol        # V1 NFT battle game (deprecated)
│       └── NFTBattleV2.sol      # V2 with VRF + epochs ⭐
│   └── script/
│       └── DeployNFTBattleV2.s.sol  # V2 deployment script
│
├── frontend/                     # Next.js 16 frontend
│   ├── app/
│   │   ├── page.tsx             # Battle lobby (main page) ⭐
│   │   ├── battle/
│   │   │   ├── page.tsx         # Redirects to /
│   │   │   └── [gameId]/        # Individual game pages
│   │   └── history/
│   │       └── page.tsx         # Player battle history
│   ├── app/
│   │   ├── decks/
│   │   │   ├── page.tsx         # Deck library listing ⭐
│   │   │   └── [id]/page.tsx    # Individual deck explorer ⭐
│   ├── components/
│   │   ├── BattleGamePlay.tsx   # Main game component ⭐
│   │   ├── BattleGamePlayV2.tsx # V2 game component ⭐
│   │   ├── BattleLobbyContentV2.tsx # V2 lobby with 4 tabs ⭐
│   │   ├── RecentGamesPanel.tsx # Platform stats + activity feed
│   │   ├── BattleList.tsx
│   │   ├── BattleCard.tsx
│   │   ├── CreateBattleModal.tsx
│   │   ├── NFTReveal.tsx        # Card reveal animation
│   │   └── TraitBreakdown.tsx   # Power calculation display
│   ├── lib/
│   │   ├── nftBattleContract.ts # V1 ABI & address
│   │   ├── nftBattleV2Contract.ts # V2 ABI & address ⭐
│   │   ├── traitPowerData.ts    # Collection trait rarities
│   │   └── wagmi.ts             # Web3 config (Base, Coinbase Wallet)
│   └── public/
│       ├── data/decks/          # Public deck data (served to browser)
│       │   ├── re_generates_power_map.json  # tokenId → power (200 entries)
│       │   └── re_generates_metadata.json   # tokenId → {name, image, attributes} ⭐
│       └── images/decks/1/      # Cached NFT images (200 files) ⭐
│           ├── 10.png
│           ├── 16.png
│           └── ... (all 200 card images)
│   └── data/
│       └── decks/               # Source deck files
│           └── re_generates_v3.json         # Full deck with metadata
│
├── scripts/                      # Utility scripts (TypeScript)
│   ├── analyze-collection-v2.ts # Calculate power levels (percentile-based) ⭐
│   ├── upload-deck-v2.ts        # Upload deck to V2 contract ⭐
│   ├── swap-nft.ts              # Swap NFT into deck + cache image ⭐
│   ├── check-nft-power.ts       # Check any NFT's calculated power
│   ├── cache-deck-images.ts     # Download all deck images locally ⭐
│   ├── verify-deck-images.ts    # Validate all images are cached ⭐
│   ├── upload-deck.ts           # V1 deck upload (legacy)
│   └── analyze-collection.ts    # V1 analyzer (legacy)
│
└── documentation/                # Reference docs
```

### Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | BattleLobbyContentV2 | Main lobby with 4 tabs (Open, Recent, My Battles, Leaderboard) |
| `/battle` | Redirect | Redirects to `/` |
| `/battle/[gameId]` | BattleGamePlayV2 | Individual game page |
| `/decks` | DecksPage | Deck library (list all available decks) ⭐ |
| `/decks/[id]` | DeckDetailPage | Deck explorer with all cards, stats, filtering ⭐ |
| `/history` | History Page | Player's battle history |

### Frontend Environment Variables

```bash
# Required
NEXT_PUBLIC_NFT_BATTLE_V2_ADDRESS="0x24b42c1a7554f1db8ec90a3b28315c7e9bab7eae"
NEXT_PUBLIC_USE_V2="true"

# Optional
NEXT_PUBLIC_NETWORK="sepolia"  # or "mainnet"
```

---

## Current State (V2)

### ✅ Deployed & Working

| Feature | Status | Notes |
|---------|--------|-------|
| **NFTBattleV2 Contract** | ✅ | Base Sepolia |
| Create game with ETH wager | ✅ | Deck-based (not collection) |
| Join game | ✅ | Auto-executes battle |
| Random card selection | ✅ | Pseudo-random + VRF option |
| Chainlink VRF integration | ✅ | For games ≥ 0.02 ETH |
| Epoch-based leaderboard | ✅ | 7-day epochs with lazy reset |
| Multi-deck architecture | ✅ | Multiple collections supported |
| Deck management | ✅ | Add/remove/swap individual cards |
| Winner payout | ✅ | Minus 2.5% fee (basis points) |
| Rematch system | ✅ | Same deck, new game |
| Cancel open game | ✅ | Full refund |
| re:generates deck | ✅ | 200 cards, percentile-based power |
| Frontend V2 components | ✅ | Lobby, game, history |
| Recent Games panel | ✅ | Platform stats + activity feed |
| **Deck Explorer** | ✅ | `/decks` - browse all cards with filtering |
| **Local Image Caching** | ✅ | All 200 images cached in `public/` |
| **Image Verification** | ✅ | 100% verified before deployment |

### 🔧 V2 Contract Functions

```solidity
// ═══════════════════════════════════════════════════════════
// DECK MANAGEMENT (Owner Only)
// ═══════════════════════════════════════════════════════════

// Create a new deck for a collection
createDeck(address _collection, string _name) returns (uint256 deckId)

// Add cards with power levels (100-999 range)
addDeckCards(uint256 _deckId, uint256[] _tokenIds, uint256[] _powers)

// Remove a single card from deck
removeDeckCard(uint256 _deckId, uint256 _tokenId)

// Clear entire deck (for full refresh)
clearDeck(uint256 _deckId)

// Enable/disable a deck
setDeckActive(uint256 _deckId, bool _active)

// ═══════════════════════════════════════════════════════════
// GAME CREATION & PLAY
// ═══════════════════════════════════════════════════════════

// Create a game with a specific deck
createGame(uint256 _deckId) payable returns (uint256 gameId)

// Join and auto-execute battle
joinGame(uint256 _gameId) payable

// Cancel an open game (full refund)
cancelGame(uint256 _gameId)

// Request a rematch (same deck, new game)
requestRematch(uint256 _gameId) payable

// Cancel pending rematch request
cancelRematchRequest(uint256 _gameId)

// ═══════════════════════════════════════════════════════════
// READ FUNCTIONS
// ═══════════════════════════════════════════════════════════

// Get game details
getGame(uint256 _gameId) returns (GameV2)

// Get deck info + card count
getDeck(uint256 _deckId) returns (Deck, uint256 cardCount)

// Get specific card in deck
getDeckCard(uint256 _deckId, uint256 _index) returns (uint256 tokenId, uint256 power)

// Total games created
gameCounter() returns (uint256)

// Current epoch number
currentEpoch() returns (uint256)

// Epoch end timestamp
epochEndTime() returns (uint256)

// Get player's epoch stats
epochWins(uint256 _epoch, address _player) returns (uint256)
epochGamesPlayed(uint256 _epoch, address _player) returns (uint256)

// ═══════════════════════════════════════════════════════════
// ADMIN FUNCTIONS (Owner Only)
// ═══════════════════════════════════════════════════════════

// Update fee (basis points, max 1000 = 10%)
setFeeBasisPoints(uint256 _feeBasisPoints)

// Set VRF threshold (games >= this use VRF)
setVrfThreshold(uint256 _threshold)

// Set minimum wager for leaderboard points
setMinWagerForPoints(uint256 _minWager)

// Set bonus multiplier for promotional events
setBonusMultiplier(uint256 _multiplier)

// Set epoch end time (triggers lazy reset on next game)
setEpochEndTime(uint256 _epochEndTime)

// Withdraw accumulated fees
withdrawFees()

// Transfer ownership
transferOwnership(address _newOwner)
```

### 📊 V2 Data Structures

```solidity
struct GameV2 {
    uint256 id;
    address player1;
    address player2;
    uint256 deckId;           // V2: deck ID instead of collection
    uint256 wagerAmount;
    GameStatus status;
    uint256 player1TokenId;
    uint256 player2TokenId;
    uint256 player1Power;
    uint256 player2Power;
    address winner;
    uint256 createdAt;
    uint256 completedAt;
    bool usedVRF;             // V2: tracks if game used Chainlink VRF
    uint256 deckVersion;      // V2: snapshot of deck version when created
}

struct Deck {
    address collection;
    string name;
    bool active;
    uint256 cardCount;
    uint256 version;          // Increments on any card change
}

struct DeckCard {
    uint256 tokenId;
    uint256 power;            // 100-999 (percentile-based)
}
```

---

## Technical Specifications

### Blockchain
- **Network:** Base (Mainnet for production, Sepolia for testing)
- **Gas costs:** ~$0.01 per transaction
- **Block time:** ~2 seconds

### Smart Contract
- **Language:** Solidity ^0.8.19
- **Framework:** Foundry
- **Size:** ~540 lines (V1)
- **Key patterns:** 
  - Pull payment (winner paid immediately)
  - Reentrancy safe (state changes before transfers)
  - Owner-only admin functions
  - Immutable (no proxy/upgrades for trust)

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Web3:** wagmi v2 + viem
- **Wallet:** Coinbase Smart Wallet (via OnchainKit)
- **State:** React hooks + wagmi query hooks

### Randomness

| Version | Source | Security | Speed | Cost |
|---------|--------|----------|-------|------|
| V1 | `block.prevrandao` + addresses | Casual | Instant | Free |
| V2 (< $50) | Same as V1 | Casual | Instant | Free |
| V2 (≥ $50) | Chainlink VRF v2.5 | Provable | ~4 sec | ~$0.10 (absorbed) |

---

## Contract Addresses

### Base Sepolia (Testnet)

| Contract | Address | Status |
|----------|---------|--------|
| **NFTBattleV2** | `0x24b42c1a7554f1db8ec90a3b28315c7e9bab7eae` | ✅ Active |
| NFTBattle V1 | `0x24B0eFB548AC550A333BEe98e18a48352a36705c` | Deprecated |
| CoinFlip (legacy) | `0x78348A74c81e626e54Be1ad2e63C5313981898D4` | Deprecated |

### V2 Contract Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| Fee | 2.5% (250 basis points) | Of total pot |
| VRF Threshold | 0.02 ETH | Games ≥ this use Chainlink VRF |
| Epoch Duration | 7 days | Lazy reset on first game after |
| Min Wager for Points | 0.0004 ETH | ~$1 minimum for leaderboard |
| VRF Coordinator | `0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE` | Base Sepolia |

### Active Decks

| Deck ID | Collection | Address | Cards | Power Range |
|---------|------------|---------|-------|-------------|
| 1 | re:generates | `0x56dFE6ae26bf3043DC8Fdf33bF739B4fF4B3BC4A` | 200 | 100-999 |

### Base Mainnet (Production)
*Not yet deployed*

---

## Development Wallets

⚠️ **TESTNET ONLY - Never use these keys with real funds**

### Owner Wallet (Contract Deployer)
```
Address:     0x652Ce09d5B4F24e262BCEb5909a9Db53bb01eEAb
Private Key: 0x97da745b1d58010c83dc2fdec2767970a82012effc3d19af5dbeaf573074fe3b
Use:         Deploy contracts, admin functions, withdraw fees
```

### Test Wallet (Player 2)
```
Address:     0x4Bf037F470f7Cc8cC8691477e6DDF525367fF718
Private Key: 0x78c3ffd01904e0f86edea8af5084ad73f9d41652a3596ece1dc366ffcb966280
Use:         Testing two-player flows
```

---

## Local Development

### Prerequisites
- Node.js v18+
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Base Sepolia ETH ([faucet](https://docs.base.org/docs/tools/network-faucets))

### 1. Clone & Install

```bash
git clone <repo-url>
cd re-flip

# Frontend
cd frontend && npm install

# Scripts
cd ../scripts && npm install
```

### 2. Configure Environment

```bash
# frontend/.env.local
NEXT_PUBLIC_NFT_BATTLE_V2_ADDRESS="0x24b42c1a7554f1db8ec90a3b28315c7e9bab7eae"
NEXT_PUBLIC_USE_V2="true"
NEXT_PUBLIC_NETWORK="sepolia"

# For scripts (export in terminal)
export DEPLOYER_PRIVATE_KEY="your_private_key"
```

### 3. Run Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### 4. Deploy New V2 Contract (if needed)

```bash
cd contracts

# Set environment variables
export PRIVATE_KEY="your_private_key"
export VRF_SUBSCRIPTION_ID="your_subscription_id"  # Optional, can be 0

# Deploy
forge script script/DeployNFTBattleV2.s.sol:DeployNFTBattleV2 \
  --rpc-url https://sepolia.base.org \
  --broadcast

# After deployment:
# 1. Update frontend/.env.local with new address
# 2. Add contract as VRF consumer (if using VRF)
# 3. Create deck and upload cards
```

### 5. Set Up a New Deck

```bash
cd scripts

# Step 1: Analyze collection and generate power map
npx tsx analyze-collection-v2.ts

# Step 2: Create deck on contract
cast send $CONTRACT "createDeck(address,string)" \
  0x56dFE6ae26bf3043DC8Fdf33bF739B4fF4B3BC4A "re:generates" \
  --rpc-url https://sepolia.base.org \
  --private-key $DEPLOYER_PRIVATE_KEY

# Step 3: Upload cards (edit upload-deck-v2.ts with contract address first)
DEPLOYER_PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY npx tsx upload-deck-v2.ts
```

---

## Scripts Reference

All scripts are in `/scripts/` and run with `npx tsx <script>.ts`

### analyze-collection-v2.ts
**Generates power levels for a collection using percentile-based ranking**

```bash
npx tsx analyze-collection-v2.ts
```

**What it does:**
1. Fetches all NFT metadata from collection (uses cache if available)
2. Calculates trait rarity within gender populations
3. Ranks all NFTs by rarity score
4. Assigns power (100-999) based on percentile position
5. Selects balanced deck (gender-balanced, tier-balanced)
6. Saves to `frontend/data/decks/`

**Output files:**
- `re_generates_v3.json` - Full deck with metadata
- `re_generates_power_map.json` - Simple tokenId → power mapping

**Configuration (edit in script):**
```typescript
const CONFIG = {
  collectionName: 're:generates',
  collectionAddress: '0x56dFE...',
  totalSupply: 6666,
  deckSize: 200,
  // ...
};
```

### upload-deck-v2.ts
**Uploads power map to V2 contract**

```bash
DEPLOYER_PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY npx tsx upload-deck-v2.ts
```

**Configuration (edit in script):**
```typescript
const CONFIG = {
  contractAddress: '0x24b42c1a...',  // V2 contract
  deckId: 1n,                         // Target deck ID
  deckFile: '../frontend/data/decks/re_generates_power_map.json',
  batchSize: 50,                      // Cards per transaction
};
```

### swap-nft.ts
**Swap a specific NFT into the deck**

```bash
# Preview swap (no changes)
npx tsx swap-nft.ts 1234 --dry-run

# Execute swap
DEPLOYER_PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY npx tsx swap-nft.ts 1234
```

**What it does:**
1. Calculates incoming NFT's power based on trait rarity
2. Finds equivalent-tier card to swap out (preserves balance)
3. Removes old card from contract
4. Adds new card with calculated power
5. **Downloads and caches the new NFT's image locally**
6. Updates metadata cache and power map
7. Removes the swapped-out card's image

**Swap logic:**
- 1/1 artwork → Power 999 (LEGENDARY), swaps with another 1/1
- Regular NFT → Power based on rarity rank, swaps same tier + gender
- Maintains deck balance (no tier inflation)

### cache-deck-images.ts
**Downloads all NFT images for a deck and caches them locally**

```bash
npx ts-node scripts/cache-deck-images.ts
```

**What it does:**
1. Reads the power map to get all token IDs
2. Fetches metadata from collection API (Bueno, OpenSea, etc.)
3. Downloads each image to `frontend/public/images/decks/{deckId}/`
4. Creates metadata cache at `frontend/public/data/decks/{collection}_metadata.json`
5. Skips already-cached images on re-run

**Why local caching?**
- ⚡ Instant image loading (no external API calls during gameplay)
- 🛡️ No rate limiting or API availability issues
- 📦 Deployable anywhere (images bundled with app)
- 🔍 Guaranteed availability for deck explorer

### verify-deck-images.ts
**Validates that all deck images are properly cached**

```bash
npx ts-node scripts/verify-deck-images.ts
```

**What it checks:**
- All tokens in power map have metadata entries
- All metadata entries have valid local image paths
- All image files exist on disk
- No empty or corrupted image files

**Exit codes:**
- `0` - All images verified successfully
- `1` - One or more images missing or invalid

### check-nft-power.ts
**Check any NFT's calculated power without adding to deck**

```bash
npx tsx check-nft-power.ts 1234
```

**Output:**
- Token name and gender
- Rarity rank within gender population  
- Calculated power and tier
- Trait-by-trait rarity breakdown
- Command to add to deck

---

## Deck Explorer

The Deck Explorer provides full transparency into all available decks and their cards.

### Routes

| Route | Description |
|-------|-------------|
| `/decks` | Library of all available decks |
| `/decks/1` | re:generates deck (200 cards) |

### Features

- 📊 **Power Distribution Chart** - Visual breakdown by tier (LEGENDARY → BASIC)
- 🔍 **Filter by Tier** - Quick filter to see only LEGENDARY, EPIC, etc.
- 🔄 **Sort Options** - By power (high/low) or Token ID
- 🔎 **Search** - Find specific cards by token ID or name
- 🎴 **Card Grid** - All cards with power badges and tier colors
- 📋 **Card Detail Modal** - Click any card to see full image + all traits

### Data Flow

```
Frontend loads from local cache (no external API calls):

/public/data/decks/re_generates_power_map.json    → tokenId → power
/public/data/decks/re_generates_metadata.json     → tokenId → {name, image, attributes}
/public/images/decks/1/*.png                      → actual image files
```

### Adding to Header

The Deck Explorer is linked from the main lobby header:
- 🎴 **Decks** link in header (visible on desktop)
- Links to `/decks` → individual deck pages

---

## Image & Metadata Caching

All deck images and metadata are cached locally for performance and reliability.

### Cache Architecture

```
frontend/public/
├── data/decks/
│   ├── re_generates_power_map.json     # tokenId → power (read by contract uploader)
│   └── re_generates_metadata.json      # tokenId → {name, localImagePath, attributes}
└── images/decks/1/
    ├── 10.png
    ├── 16.png
    └── ... (200 images, one per card)
```

### Cache Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DECK CREATION                                │
├─────────────────────────────────────────────────────────────────────┤
│  1. Run analyze-collection-v2.ts    → Generate power levels         │
│  2. Run cache-deck-images.ts        → Download all images locally   │
│  3. Run verify-deck-images.ts       → Confirm 100% cached           │
│  4. Run upload-deck-v2.ts           → Push power map to contract    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        CARD SWAP                                    │
├─────────────────────────────────────────────────────────────────────┤
│  1. Run swap-nft.ts 1234           → Calculates power               │
│  2. → Downloads new image           → Caches locally                │
│  3. → Updates metadata cache        → Updates power map             │
│  4. → Removes old image             → Contract updated              │
│  5. Run verify-deck-images.ts      → Confirm still 100%             │
└─────────────────────────────────────────────────────────────────────┘
```

### Benefits

| Benefit | Description |
|---------|-------------|
| **Speed** | Images load instantly from local files |
| **Reliability** | No dependency on external APIs during gameplay |
| **Volume Ready** | Can handle high traffic without API rate limits |
| **Verifiable** | 100% of deck verified before deployment |
| **Self-Contained** | Deploy to any host (Vercel, Fly.io) with images bundled |

### Verification

Always verify before deploying:

```bash
npx ts-node scripts/verify-deck-images.ts
# Expected output:
# 📦 Deck has 200 tokens in power map
# 📄 Metadata has 200 entries
# 🖼️  Images directory has 200 files
# ✅ OK: 200/200
# 🎉 All tokens verified successfully!
```

---

## Admin Operations

### V2 Contract Address
```bash
export CONTRACT="0x24b42c1a7554f1db8ec90a3b28315c7e9bab7eae"
export RPC="https://sepolia.base.org"
```

### Check Accumulated Fees

```bash
cast call $CONTRACT "accumulatedFees()" --rpc-url $RPC
```

### Withdraw Fees

```bash
cast send $CONTRACT "withdrawFees()" \
  --rpc-url $RPC \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Change Fee (Basis Points)

```bash
# 250 = 2.5%, 100 = 1%, 500 = 5%
cast send $CONTRACT "setFeeBasisPoints(uint256)" 250 \
  --rpc-url $RPC \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Set VRF Threshold

```bash
# Games >= this amount use Chainlink VRF
# 0.02 ether = 20000000000000000 wei
cast send $CONTRACT "setVrfThreshold(uint256)" 20000000000000000 \
  --rpc-url $RPC \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Create New Deck

```bash
cast send $CONTRACT "createDeck(address,string)" \
  0xCOLLECTION_ADDRESS "Collection Name" \
  --rpc-url $RPC \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Add Cards to Deck

```bash
# Add single card
cast send $CONTRACT "addDeckCards(uint256,uint256[],uint256[])" \
  1 "[1234]" "[850]" \
  --rpc-url $RPC \
  --private-key $DEPLOYER_PRIVATE_KEY

# Add multiple cards
cast send $CONTRACT "addDeckCards(uint256,uint256[],uint256[])" \
  1 "[1,2,3]" "[999,850,700]" \
  --rpc-url $RPC \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Remove Card from Deck

```bash
cast send $CONTRACT "removeDeckCard(uint256,uint256)" 1 1234 \
  --rpc-url $RPC \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Activate/Deactivate Deck

```bash
# Activate
cast send $CONTRACT "setDeckActive(uint256,bool)" 1 true \
  --rpc-url $RPC \
  --private-key $DEPLOYER_PRIVATE_KEY

# Deactivate
cast send $CONTRACT "setDeckActive(uint256,bool)" 1 false \
  --rpc-url $RPC \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Check Deck Info

```bash
# Get deck details
cast call $CONTRACT "getDeck(uint256)" 1 --rpc-url $RPC

# Get specific card
cast call $CONTRACT "getDeckCard(uint256,uint256)" 1 0 --rpc-url $RPC
```

### Set Epoch End Time

```bash
# Unix timestamp for when epoch should end
# Example: February 9, 2026 at midnight UTC
cast send $CONTRACT "setEpochEndTime(uint256)" 1739059200 \
  --rpc-url $RPC \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Check Current Epoch

```bash
cast call $CONTRACT "currentEpoch()" --rpc-url $RPC
cast call $CONTRACT "epochEndTime()" --rpc-url $RPC
```

### Get Player Epoch Stats

```bash
cast call $CONTRACT "epochWins(uint256,address)" 1 0xPLAYER_ADDRESS --rpc-url $RPC
cast call $CONTRACT "epochGamesPlayed(uint256,address)" 1 0xPLAYER_ADDRESS --rpc-url $RPC
```

---

## Design Decisions

### Why Auto-Execute on Join?

**Problem:** Original flow required manual "draw" action after joining, adding friction and potential griefing (player joins but never draws).

**Solution:** Battle executes atomically when player 2 joins. No waiting, no griefing, instant results.

### Why Pseudo-Random for V1?

**Problem:** Chainlink VRF costs ~$0.10 per request, which exceeds profit on small wagers.

**Solution:** 
- V1: Pseudo-random for all games (acceptable for testnet/casual play)
- V2: Threshold-based (~$50 threshold for VRF)

### Why Lazy Leaderboard Reset?

**Problem:** Smart contracts can't execute on a schedule automatically.

**Solution:** Store `epochEndTime`. First game after deadline triggers:
1. Emit snapshot event with top 10
2. Reset leaderboard
3. Set new epoch

**Tradeoff:** Snapshot happens at first post-deadline interaction, not exactly at deadline. Acceptable because:
- You can check standings anytime before deadline
- Snapshot is immutable once emitted
- No cost for automated triggers

### Why 2.5% Fee?

**Industry benchmarks:**
- OpenSea: 2.5%
- Magic Eden: 2%
- Traditional casinos: 2-5% house edge
- Sports betting: 4-5% vig

2.5% is competitive, sustainable, and matches user expectations.

### Why Immutable Contracts?

**Trust.** Upgradeable contracts introduce risk:
- Rug pull concerns
- Regulatory scrutiny
- User hesitation

**Approach:** Deploy V1, gather feedback, deploy V2 with improvements. Users choose which version to use. Old contracts remain functional.

### Why Ties Go to Player 1?

In case of equal power levels, player 1 (game creator) wins. This is:
- Deterministic (no randomness needed for tiebreaker)
- Slight first-mover advantage
- Extremely rare with continuous power values

---

## Future Considerations

### Cross-Collection Battles
Allow Collection A vs Collection B with normalized power scales:
```solidity
normalizedPower = (power * 1000) / deckMaxPower
```
Each deck stores its max power for normalization.

### Tournament Mode
- Bracket-style elimination
- Entry fees pool into prize
- Higher stakes, higher rewards

### Achievement System
- Win streaks
- Total wins milestones
- First win with each collection

### Social Features
- Friend challenges
- Private games with invite codes
- Spectator mode

---

## Glossary

| Term | Definition |
|------|------------|
| **Deck** | Pre-loaded set of NFT token IDs + power levels |
| **Epoch** | Leaderboard period (e.g., 1 week) |
| **Power Level** | Sum of inverse trait rarities |
| **VRF** | Verifiable Random Function (Chainlink) |
| **Wager** | ETH amount bet by each player |
| **Pot** | Total wager from both players |
| **House Edge** | Platform fee (2.5%) |

---

## AI/Copilot Quick Reference

This section helps AI assistants understand the codebase quickly.

### Key Files by Function

| Task | Primary File | Notes |
|------|--------------|-------|
| V2 Contract ABI | `frontend/lib/nftBattleV2Contract.ts` | Types + ABI for V2 |
| Game creation | `frontend/components/CreateBattleModal.tsx` | Uses deck ID |
| Game gameplay | `frontend/components/BattleGamePlayV2.tsx` | V2 game logic |
| Lobby display | `frontend/components/BattleLobbyContentV2.tsx` | 4-tab layout |
| Recent games | `frontend/components/RecentGamesPanel.tsx` | Platform stats |
| Power calculation | `scripts/analyze-collection-v2.ts` | Percentile algorithm |
| Deck upload | `scripts/upload-deck-v2.ts` | Batch upload |
| Card swap | `scripts/swap-nft.ts` | Individual card management |
| Power check | `scripts/check-nft-power.ts` | Query single NFT |
| Contract source | `contracts/src/NFTBattleV2.sol` | Solidity source |
| Deploy script | `contracts/script/DeployNFTBattleV2.s.sol` | Foundry deploy |

### Common Operations

**Add NFT to deck (with auto-calculated power):**
```bash
cd scripts && npx tsx swap-nft.ts <tokenId>
```

**Check NFT's calculated power:**
```bash
cd scripts && npx tsx check-nft-power.ts <tokenId>
```

**Regenerate entire deck:**
```bash
cd scripts
npx tsx analyze-collection-v2.ts  # Generate power map
DEPLOYER_PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY npx tsx upload-deck-v2.ts  # Upload
```

**Deploy new contract:**
```bash
cd contracts
PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY forge script script/DeployNFTBattleV2.s.sol:DeployNFTBattleV2 --rpc-url https://sepolia.base.org --broadcast
```

### Power Algorithm Summary

```
1. Fetch all NFT metadata (cached in scripts/cache/)
2. Calculate trait rarity within gender (male/female separate)
3. Raw score = sum(1 / trait_rarity) for each trait
4. Rank all NFTs by raw score (highest = rarest)
5. Power = 999 - (rank / total × 899)
6. 1/1 artworks automatically get power 999
```

### V2 Contract Key Differences from V1

| V1 | V2 |
|----|-----|
| `createGame(address collection)` | `createGame(uint256 deckId)` |
| `addDeckCards(address, ...)` | `addDeckCards(uint256 deckId, ...)` |
| No card removal | `removeDeckCard(uint256 deckId, uint256 tokenId)` |
| `feePercent` (1 = 1%) | `feeBasisPoints` (250 = 2.5%) |
| No epochs | `currentEpoch`, `epochEndTime`, lazy reset |
| No VRF | Optional Chainlink VRF for ≥0.02 ETH games |

---

## Changelog

### V2 (Current - February 2026)
- **NFTBattleV2 contract** deployed to Base Sepolia
- **Chainlink VRF integration** for high-value games (≥0.02 ETH)
- **Epoch-based leaderboard** with lazy reset (7-day epochs)
- **Multi-deck architecture** with individual card management
- **Percentile-based power** (100-999) for cross-collection fairness
- **Basis point fees** (2.5% = 250 bps)
- **removeDeckCard()** function for individual card swaps
- **Frontend V2 components** (lobby, game, history)
- **Recent Games panel** with platform stats
- **Scripts updated**: analyze-collection-v2.ts, upload-deck-v2.ts, swap-nft.ts

### V1 (Deprecated - January 2026)
- Initial NFTBattle contract
- Auto-execute on join
- Basic leaderboard tracking
- Rematch system
- re:generates collection (200 cards)
- Frontend with context-aware UI

---

*Last updated: February 6, 2026*
