# Base-Solana Bridge - Base Documentation

**Source:** https://docs.base.org/base-chain/quickstart/base-solana-bridge
**Scraped:** 2026-02-04T10:27:19.855505

---

## Table of Contents

  - ​How it works
    - ​On Base
    - ​On Solana
  - ​Bridging Flows
  - Solana → Base
  - Base → Solana
  - Terminally Onchain
  - ​Solana to Base
    - ​Auto-Relay Example
    - ​Wrap Custom SPL Tokens
  - ​Base to Solana
  - ​Utilities
    - ​Address Conversion
    - ​Keypair Management
    - ​Transaction Building
  - ​Terminally Onchain Example
    - ​Running the Terminal
  - ​Contract Addresses
    - ​Base Mainnet
    - ​Solana Mainnet
    - ​Base Sepolia
    - ​Solana Devnet
  - ​Resources
  - Base Bridge Repository
  - Solana Explorer
  - Base Explorer
  - Discord Support

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationQuickstartBase-Solana BridgeGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubStatusChain StatsExplorerSupportBlogQuickstartWhy Base?Deploy on BaseConnecting to BaseBase-Mainnet BridgeBase-Solana BridgeNetwork InformationBase ContractsEcosystem ContractsNetwork FeesBlock BuildingTransaction FinalityDifferences: Ethereum & BaseTroubleshooting TransactionsConfiguration ChangelogFlashblocksAppsNode ProvidersFlashblocks FAQNode OperatorsGetting StartedPerformance TuningSnapshotsTroubleshootingBuilder CodesBase Builder CodesBuilder Codes FAQToolsBase ProductsOnchain Registry APINode ProvidersBlock ExplorersNetwork FaucetsOraclesUser OnboardingData IndexersCross-chainAccount AbstractionOnrampsTokens in Coinbase WalletSecuritySecurity Council for BaseAvoid Malicious FlagsReport a VulnerabilityOn this pageHow it worksOn BaseOn SolanaBridging FlowsSolana to BaseAuto-Relay ExampleWrap Custom SPL TokensBase to SolanaUtilitiesAddress ConversionKeypair ManagementTransaction BuildingTerminally Onchain ExampleRunning the TerminalContract AddressesBase MainnetSolana MainnetBase SepoliaSolana DevnetResourcesThe Base-Solana bridge enables bidirectional token transfers and message passing between Base and
Solana networks. This bridge allows you to:

Transfer tokens between Base and Solana
Send arbitrary cross-chain messages
Combine both flows (transfer with arbitrary calls)
Deploy wrapped tokens on either chain

This guide covers the bridge architecture, the production addresses, and practical implementation
patterns.
​How it works
​On Base
The Base bridge contract locks or burns tokens when sending tokens to Solana, and mints or unlocks
tokens when receiving tokens from Solana. The Bridge contract itself builds Merkle trees from
outgoing messages. Validators verify the Merkle root every ~300 finalized blocks and relay it to
Solana. You then prove your message exists in the tree to complete the transfer on Solana.
Tokens that are native to Base are locked and tokens that are native to Solana are burned when bridging to Solana.
Tokens that are native to Solana are minted and tokens that are native to Base are unlocked when bridging to Base.
Key Smart contracts:

Bridge Contract: Handles outgoing transfers
CrossChainERC20: Mintable/burnable tokens for cross-chain transfers
BridgeValidator: Validates messages with oracle signatures
Twin Contract: Your personal smart contract on Base for executing calls from Solana

What is the Twin Contract?
Each Solana wallet deterministically maps to a Twin contract on Base. When you attach a contract call
to a bridge message, the call is executed from this Twin contract, ie. the Twin becomes msg.sender on Base.
​On Solana
The Solana bridge program handles token transfers by locking or burning tokens and emitting events.
For messaging, validators relay these events to Base where they are executed through your Twin
contract.
Key Programs (Solana Mainnet-Beta):

Bridge Program: Handles outgoing transfers and message commitments.
Base Relayer Program: Optional relayer that can prepay gas on Base.

The relayer program is not part of the core bridge. It is an optional convenience layer that can pay
Base gas fees on behalf of the Solana user in the Solana → Base direction.The user would still need to pay the gas fee by adding PayForRelay to the Solana transaction.
If the user does not add PayForRelay, the relayer program will not pay the gas fee.
You can access the full repository here:
Base Bridge - Official Repositoryhttps://github.com/base/bridge
​Bridging Flows
Solana → BasePush-based with optional relayer for instant execution on BaseBase → SolanaProof-based burn and unlock with full custodyTerminally OnchainProduction terminal UI for bridging + contract calls
​Solana to Base
Flow: Lock SOL/SPL → (Optional) Pay for relay → Validators approve → Mint + execute on Base
The Solana to Base bridge uses a pull-based model that requires 3 steps:

Initiate the bridge on Solana - Lock your SOL or native SPL token in a Solana vault
Wait for validators to pre-approve the message - Validators verify and approve your bridge message
Execute the message on Base - The approved message is executed on Base to mint SOL and execute any additional arbitrary calls

When bridging from Solana to Base, native SOL/SPL are locked and ERC20 SOL is minted on Base.
If your Solana → Base message includes a call to execute, you must ensure
the ABI-encoded call is executable on Base. A call that cannot be executed
on Base cannot be undone. If you bridge tokens in the same transaction,
those tokens will be locked.
Reference scripts (auto-relay, token wrapping, CLI utilities) live in the scripts/ directory of the official repository:
Solana → Base CLI Scriptshttps://github.com/base/bridge/tree/main/scripts/src/commands/sol/bridge
​Auto-Relay Example
This is a sample script that shows how to bridge SOL with auto-relay
solToBaseWithAutoRelay/index.tsReport incorrect codeCopyAsk AI// Configure
const TO = "0x8c1a617bdb47342f9c17ac8750e0b070c372c721"; // Base address
const AMOUNT = 0.001; // SOL amount

// Bridge SOL with auto-relay
const ixs = [
 getBridgeSolInstruction({
 payer,
 from: payer,
 solVault: solVaultAddress,
 bridge: bridgeAccountAddress,
 outgoingMessage,
 to: toBytes(TO),
 remoteToken: toBytes("0xC5b9112382f3c87AFE8e1A28fa52452aF81085AD"), // SOL on Base
 amount: BigInt(AMOUNT * 10**9),
 }),
 await buildPayForRelayIx(RELAYER_PROGRAM_ID, outgoingMessage, payer)
];

await buildAndSendTransaction(SOLANA_RPC_URL, ixs, payer);
See all 20 lines
For more details, see the Solana to Base Relay Script.
​Wrap Custom SPL Tokens
The example above shows how to bridge native SOL to Base.
To bridge custom SPL tokens,
you need to create wrapped ERC20 representations on Base using the CrossChainERC20Factory.
Token Wrapping Examplehttps://github.com/base/bridge/blob/main/scripts/src/commands/sol/bridge/solana-to-base/wrap-token.handler.ts
wrapSolTokenOnBase/index.tsReport incorrect codeCopyAsk AI// Deploy wrapped token on Base
const mintBytes32 = getBase58Codec().encode(SOLANA_SPL_MINT_ADDRESS).toHex();

await client.writeContract({
 address: "0x58207331CBF8Af87BB6453b610E6579D9878e4EA", // Factory
 abi: TokenFactory,
 functionName: "deploy",
 args: [`0x${mintBytes32}`, "Token Name", "SYMBOL", 9],
});
See all 9 lines
​Base to Solana
Flow: Burn ERC20 SOL on Base → Wait for finalization → Generate Merkle proof → Execute on Solana
Burn wrapped tokens on Base, wait for the message to become provable, then execute the proof on
Solana to unlock the native asset. This path offers full custody and requires a prover.
Base → Solana Examplehttps://github.com/base/bridge/blob/main/scripts/src/internal/sol/base.ts
bridgeSolFromBaseToSolana/index.tsReport incorrect codeCopyAsk AI// Step 1: Burn SOL on Base
const transfer = {
 localToken: "0xC5b9112382f3c87AFE8e1A28fa52452aF81085AD", // SOL (on Base)
 remoteToken: pubkeyToBytes32(SOL_ADDRESS),
 to: pubkeyToBytes32(solanaAddress),
 remoteAmount: BigInt(AMOUNT * 10**9),
};

const txHash = await client.writeContract({
 address: "0xB2068ECCDb908902C76E3f965c1712a9cF64171E", // Bridge
 abi: Bridge,
 functionName: "bridgeToken",
 args: [transfer, []],
});

// Step 2: Wait for finalization
const isProvable = await isBridgeMessageProvable(txHash);

// Step 3: Generate proof
const { event, rawProof } = await generateProof(txHash, baseBlockNumber);

// Step 4: Execute on Solana
const proveIx = getProveMessageInstruction({
 nonce: event.message.nonce,
 sender: toBytes(event.message.sender),
 data: toBytes(event.message.data),
 proof: rawProof.map(e => toBytes(e)),
 messageHash: toBytes(event.messageHash),
});

const relayIx = getRelayMessageInstruction({ message: messagePda });
await buildAndSendTransaction(SOLANA_RPC_URL, [proveIx, relayIx], payer);
See all 32 lines
If you operate a relayer that signs and submits Solana transactions for users in the Base → Solana
direction, do not sign transactions that require your relayer pubkey as a signer.A malicious user can encode a transaction that includes your relayer pubkey as a required signer; if
you sign and submit it, you may unintentionally authorize arbitrary instructions (including ones
that can steal relayer funds). As a baseline mitigation, ignore any transaction that specifies your
pubkey as a signer.
​Utilities
The repository includes utilities for converting between Solana and Base address formats,
getting your Solana CLI keypair for signing transactions,
and building and sending Solana transactions.
Base Bridge Examples - Utilitieshttps://github.com/base/bridge/tree/main/scripts/src/commands
​Address Conversion
Convert Solana pubkey to bytes32 for Base contracts:
example.tsReport incorrect codeCopyAsk AI// Convert Solana pubkey to bytes32 for Base contracts
import { pubkeyToBytes32 } from "./utils/pubkeyToBytes32";

const bytes32Address = pubkeyToBytes32(solanaAddress);

​Keypair Management
Get your Solana CLI keypair for signing transactions:
example.tsReport incorrect codeCopyAsk AIimport { getSolanaCliConfigKeypairSigner } from "./utils/keypair";

const payer = await getSolanaCliConfigKeypairSigner();

​Transaction Building
Build and send Solana transactions:
example.tsReport incorrect codeCopyAsk AIimport { buildAndSendTransaction } from "./utils/buildAndSendTransaction";

const signature = await buildAndSendTransaction(SOLANA_RPC_URL, ixs, payer);

​Terminally Onchain Example
Terminally Onchainhttps://github.com/base/sol2base
Terminally Onchain is a production Next.js app that exposes the bridge via a
command terminal UI. Users connect a Solana wallet, type commands such as to bridge and call a contract on Base:
Report incorrect codeCopyAsk AIbridge 0.0001 sol 0xYourTwin --call-contract 0x311935Cd80B76769bF2ecC9D8Ab7635b2139cf82 \
 --call-selector "transfer(address,uint256)" \
 --call-args 0x0000000000000000000000000000000000000000 100000000000000

The workflow:

Parse command: The terminal parser resolves the asset, destination, and optional Base call (selector + args + value).
Stage bridge: queueBridge validates SPL overrides, ABI-encodes the Base call via encodeFunctionData, and stages relay overrides.
Execute: solanaBridge.bridge() resolves the destination (ENS/Basename), ensures balances, and calls realBridgeImplementation to sign and send the Solana transaction.
Relay + Call: If relay gas is prepaid, the Base Relayer executes the attached call from the user’s Twin contract immediately after ERC20 SOL is minted.

Key implementation references:

src/lib/bridge.ts: Asset resolution (supports mint addresses), environment-aware RPC connections, and call attachment support.
src/lib/realBridgeImplementation.ts: Builds Solana transactions with PayForRelay + bridge_sol/bridge_spl instructions, using per-environment PDAs and gas-fee receivers.
src/components/MainContent.tsx: Terminal UI with command staging, log viewer, and ABI encoding for arbitrary Base calls.
src/components/WalletConnection.tsx: Fetches the deterministic Twin address on Base Mainnet/Sepolia for the connected Solana wallet.

​Running the Terminal
TerminalReport incorrect codeCopyAsk AIgit clone https://github.com/base/sol2base.git
cd sol2base
npm install --legacy-peer-deps

# Configure env (RPC URLs, relayer addresses, CDP API keys, etc.)
cp env.template .env.local

npm run dev # defaults to http://localhost:3000

The terminal exposes both Base Sepolia ↔ Solana Devnet and Base Mainnet ↔ Solana Mainnet. Use the
network dropdown in the UI to switch.Set CDP_API_KEY in your .env file to get access to the faucet.
​Contract Addresses
​Base Mainnet
Report incorrect codeCopyAsk AI{
 "Bridge": "0x3eff766C76a1be2Ce1aCF2B69c78bCae257D5188",
 "BridgeValidator": "0xAF24c1c24Ff3BF1e6D882518120fC25442d6794B",
 "CrossChainERC20Factory": "0xDD56781d0509650f8C2981231B6C917f2d5d7dF2",
 "SOL": "0x311935Cd80B76769bF2ecC9D8Ab7635b2139cf82"
}

​Solana Mainnet
Report incorrect codeCopyAsk AI{
 "BridgeProgram": "HNCne2FkVaNghhjKXapxJzPaBvAKDG1Ge3gqhZyfVWLM",
 "BaseRelayerProgram": "g1et5VenhfJHJwsdJsDbxWZuotD5H4iELNG61kS4fb9"
}

​Base Sepolia
Report incorrect codeCopyAsk AI{
 "Bridge": "0x01824a90d32A69022DdAEcC6C5C14Ed08dB4EB9B",
 "BridgeValidator": "0xa80C07DF38fB1A5b3E6a4f4FAAB71E7a056a4EC7",
 "CrossChainERC20Factory": "0x488EB7F7cb2568e31595D48cb26F63963Cc7565D",
 "SOL": "0xCace0c896714DaF7098FFD8CC54aFCFe0338b4BC",
 "FLYWHEEL_ADDRESS": "0x00000F14AD09382841DB481403D1775ADeE1179F",
 "BRIDGE_CAMPAIGN_ADDRESS": "0xE2AD1C34382410C30d826B019A0B3700F5c4e6c9"
}

​Solana Devnet
Report incorrect codeCopyAsk AI{
 "BridgeProgram": "7c6mteAcTXaQ1MFBCrnuzoZVTTAEfZwa6wgy4bqX3KXC",
 "BaseRelayerProgram": "56MBBEYAtQAdjT4e1NzHD8XaoyRSTvfgbSVVcEcHj51H",
 "GasFeeReceiver": "AFs1LCbodhvwpgX3u3URLsud6R1XMSaMiQ5LtXw4GKYT"
}

​Resources
Base Bridge RepositorySource code, contracts, programs, and scriptsSolana ExplorerMonitor Solana mainnet-beta transactionsBase ExplorerMonitor Base Mainnet transactionsDiscord SupportGet help from the Base communityWas this page helpful?YesNoSuggest editsRaise issueBridging an L1 token to BasePreviousContract AddressesNext⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
// Configure
const TO = "0x8c1a617bdb47342f9c17ac8750e0b070c372c721"; // Base address
const AMOUNT = 0.001; // SOL amount

// Bridge SOL with auto-relay
const ixs = [
  getBridgeSolInstruction({
    payer,
    from: payer,
    solVault: solVaultAddress,
    bridge: bridgeAccountAddress,
    outgoingMessage,
    to: toBytes(TO),
    remoteToken: toBytes("0xC5b9112382f3c87AFE8e1A28fa52452aF81085AD"), // SOL on Base
    amount: BigInt(AMOUNT * 10**9),
  }),
  await buildPayForRelayIx(RELAYER_PROGRAM_ID, outgoingMessage, payer)
];

await buildAndSendTransaction(SOLANA_RPC_URL, ixs, payer);
```

### Code Block 2 (unknown)

```unknown
// Deploy wrapped token on Base
const mintBytes32 = getBase58Codec().encode(SOLANA_SPL_MINT_ADDRESS).toHex();

await client.writeContract({
  address: "0x58207331CBF8Af87BB6453b610E6579D9878e4EA", // Factory
  abi: TokenFactory,
  functionName: "deploy",
  args: [`0x${mintBytes32}`, "Token Name", "SYMBOL", 9],
});
```

### Code Block 3 (unknown)

```unknown
// Step 1: Burn SOL on Base
const transfer = {
  localToken: "0xC5b9112382f3c87AFE8e1A28fa52452aF81085AD", // SOL (on Base)
  remoteToken: pubkeyToBytes32(SOL_ADDRESS),
  to: pubkeyToBytes32(solanaAddress),
  remoteAmount: BigInt(AMOUNT * 10**9),
};

const txHash = await client.writeContract({
  address: "0xB2068ECCDb908902C76E3f965c1712a9cF64171E", // Bridge
  abi: Bridge,
  functionName: "bridgeToken",
  args: [transfer, []],
});

// Step 2: Wait for finalization
const isProvable = await isBridgeMessageProvable(txHash);

// Step 3: Generate proof
const { event, rawProof } = await generateProof(txHash, baseBlockNumber);

// Step 4: Execute on Solana
const proveIx = getProveMessageInstruction({
  nonce: event.message.nonce,
  sender: toBytes(event.message.sender),
  data: toBytes(event.message.data),
  proof: rawProof.map(e => toBytes(e)),
  messageHash: toBytes(event.messageHash),
});

const relayIx = getRelayMessageInstruction({ message: messagePda });
await buildAndSendTransaction(SOLANA_RPC_URL, [proveIx, relayIx], payer);
```

### Code Block 4 (unknown)

```unknown
// Convert Solana pubkey to bytes32 for Base contracts
import { pubkeyToBytes32 } from "./utils/pubkeyToBytes32";

const bytes32Address = pubkeyToBytes32(solanaAddress);
```

### Code Block 5 (unknown)

```unknown
import { getSolanaCliConfigKeypairSigner } from "./utils/keypair";

const payer = await getSolanaCliConfigKeypairSigner();
```

### Code Block 6 (unknown)

```unknown
import { buildAndSendTransaction } from "./utils/buildAndSendTransaction";

const signature = await buildAndSendTransaction(SOLANA_RPC_URL, ixs, payer);
```

### Code Block 7 (unknown)

```unknown
bridge 0.0001 sol 0xYourTwin --call-contract 0x311935Cd80B76769bF2ecC9D8Ab7635b2139cf82 \
  --call-selector "transfer(address,uint256)" \
  --call-args 0x0000000000000000000000000000000000000000 100000000000000
```

### Code Block 8 (unknown)

```unknown
git clone https://github.com/base/sol2base.git
cd sol2base
npm install --legacy-peer-deps

# Configure env (RPC URLs, relayer addresses, CDP API keys, etc.)
cp env.template .env.local

npm run dev   # defaults to http://localhost:3000
```

### Code Block 9 (unknown)

```unknown
{
  "Bridge": "0x3eff766C76a1be2Ce1aCF2B69c78bCae257D5188",
  "BridgeValidator": "0xAF24c1c24Ff3BF1e6D882518120fC25442d6794B",
  "CrossChainERC20Factory": "0xDD56781d0509650f8C2981231B6C917f2d5d7dF2",
  "SOL": "0x311935Cd80B76769bF2ecC9D8Ab7635b2139cf82"
}
```

### Code Block 10 (unknown)

```unknown
{
  "BridgeProgram": "HNCne2FkVaNghhjKXapxJzPaBvAKDG1Ge3gqhZyfVWLM",
  "BaseRelayerProgram": "g1et5VenhfJHJwsdJsDbxWZuotD5H4iELNG61kS4fb9"
}
```

### Code Block 11 (unknown)

```unknown
{
  "Bridge": "0x01824a90d32A69022DdAEcC6C5C14Ed08dB4EB9B",
  "BridgeValidator": "0xa80C07DF38fB1A5b3E6a4f4FAAB71E7a056a4EC7",
  "CrossChainERC20Factory": "0x488EB7F7cb2568e31595D48cb26F63963Cc7565D",
  "SOL": "0xCace0c896714DaF7098FFD8CC54aFCFe0338b4BC",
  "FLYWHEEL_ADDRESS": "0x00000F14AD09382841DB481403D1775ADeE1179F",
  "BRIDGE_CAMPAIGN_ADDRESS": "0xE2AD1C34382410C30d826B019A0B3700F5c4e6c9"
}
```

### Code Block 12 (unknown)

```unknown
{
  "BridgeProgram": "7c6mteAcTXaQ1MFBCrnuzoZVTTAEfZwa6wgy4bqX3KXC",
  "BaseRelayerProgram": "56MBBEYAtQAdjT4e1NzHD8XaoyRSTvfgbSVVcEcHj51H",
  "GasFeeReceiver": "AFs1LCbodhvwpgX3u3URLsud6R1XMSaMiQ5LtXw4GKYT"
}
```

---

## Related Links

- [Skip to main content](https://docs.base.org/base-chain/quickstart/base-solana-bridge#content-area)
- [Base Documentationhome page](https://docs.base.org/)
- [Get Started](https://docs.base.org/get-started/base)
- [Base Chain](https://docs.base.org/base-chain/quickstart/why-base)
- [Base Account](https://docs.base.org/base-account/overview/what-is-base-account)
- [Base App](https://docs.base.org/base-app/introduction/beta-faq)
- [Mini Apps](https://docs.base.org/mini-apps/quickstart/migrate-existing-apps)
- [OnchainKit](https://docs.base.org/onchainkit/latest/getting-started/overview)
- [Cookbook](https://docs.base.org/cookbook/onboard-any-user)
- [Showcase](https://docs.base.org/showcase)
- [Learn](https://docs.base.org/learn/welcome)
- [Status](https://status.base.org/)
- [Chain Stats](https://www.base.org/stats)
- [Deploy on Base](https://docs.base.org/base-chain/quickstart/deploy-on-base)
- [Connecting to Base](https://docs.base.org/base-chain/quickstart/connecting-to-base)
- [Base-Mainnet Bridge](https://docs.base.org/base-chain/quickstart/bridge-token)
- [Base-Solana Bridge](https://docs.base.org/base-chain/quickstart/base-solana-bridge)
- [Base Contracts](https://docs.base.org/base-chain/network-information/base-contracts)
- [Ecosystem Contracts](https://docs.base.org/base-chain/network-information/ecosystem-contracts)
- [Network Fees](https://docs.base.org/base-chain/network-information/network-fees)
- [Block Building](https://docs.base.org/base-chain/network-information/block-building)
- [Transaction Finality](https://docs.base.org/base-chain/network-information/transaction-finality)
- [Differences: Ethereum & Base](https://docs.base.org/base-chain/network-information/diffs-ethereum-base)
- [Troubleshooting Transactions](https://docs.base.org/base-chain/network-information/troubleshooting-transactions)
- [Configuration Changelog](https://docs.base.org/base-chain/network-information/configuration-changelog)
- [Apps](https://docs.base.org/base-chain/flashblocks/apps)
- [Node Providers](https://docs.base.org/base-chain/flashblocks/node-providers)
- [Flashblocks FAQ](https://docs.base.org/base-chain/flashblocks/docs)
- [Getting Started](https://docs.base.org/base-chain/node-operators/run-a-base-node)
- [Performance Tuning](https://docs.base.org/base-chain/node-operators/performance-tuning)
- [Snapshots](https://docs.base.org/base-chain/node-operators/snapshots)
- [Troubleshooting](https://docs.base.org/base-chain/node-operators/troubleshooting)
- [Base Builder Codes](https://docs.base.org/base-chain/builder-codes/builder-codes)
- [Builder Codes FAQ](https://docs.base.org/base-chain/builder-codes/builder-codes-faq)
- [Base Products](https://docs.base.org/base-chain/tools/base-products)
- [Onchain Registry API](https://docs.base.org/base-chain/tools/onchain-registry-api)
- [Node Providers](https://docs.base.org/base-chain/tools/node-providers)
- [Block Explorers](https://docs.base.org/base-chain/tools/block-explorers)
- [Network Faucets](https://docs.base.org/base-chain/tools/network-faucets)
- [Oracles](https://docs.base.org/base-chain/tools/oracles)
- [User Onboarding](https://docs.base.org/base-chain/tools/onboarding)
- [Data Indexers](https://docs.base.org/base-chain/tools/data-indexers)
- [Cross-chain](https://docs.base.org/base-chain/tools/cross-chain)
- [Account Abstraction](https://docs.base.org/base-chain/tools/account-abstraction)
- [Onramps](https://docs.base.org/base-chain/tools/onramps)
- [Tokens in Coinbase Wallet](https://docs.base.org/base-chain/tools/tokens-in-wallet)
- [Security Council for Base](https://docs.base.org/base-chain/security/security-council)
- [Avoid Malicious Flags](https://docs.base.org/base-chain/security/avoid-malicious-flags)
- [Report a Vulnerability](https://docs.base.org/base-chain/security/report-vulnerability)
- [How it works](https://docs.base.org/base-chain/quickstart/base-solana-bridge#how-it-works)
- [On Base](https://docs.base.org/base-chain/quickstart/base-solana-bridge#on-base)
- [On Solana](https://docs.base.org/base-chain/quickstart/base-solana-bridge#on-solana)
- [Bridging Flows](https://docs.base.org/base-chain/quickstart/base-solana-bridge#bridging-flows)
- [Solana to Base](https://docs.base.org/base-chain/quickstart/base-solana-bridge#solana-to-base)
- [Auto-Relay Example](https://docs.base.org/base-chain/quickstart/base-solana-bridge#auto-relay-example)
- [Wrap Custom SPL Tokens](https://docs.base.org/base-chain/quickstart/base-solana-bridge#wrap-custom-spl-tokens)
- [Base to Solana](https://docs.base.org/base-chain/quickstart/base-solana-bridge#base-to-solana)
- [Utilities](https://docs.base.org/base-chain/quickstart/base-solana-bridge#utilities)
- [Address Conversion](https://docs.base.org/base-chain/quickstart/base-solana-bridge#address-conversion)
- [Keypair Management](https://docs.base.org/base-chain/quickstart/base-solana-bridge#keypair-management)
- [Transaction Building](https://docs.base.org/base-chain/quickstart/base-solana-bridge#transaction-building)
- [Terminally Onchain Example](https://docs.base.org/base-chain/quickstart/base-solana-bridge#terminally-onchain-example)
- [Running the Terminal](https://docs.base.org/base-chain/quickstart/base-solana-bridge#running-the-terminal)
- [Contract Addresses](https://docs.base.org/base-chain/quickstart/base-solana-bridge#contract-addresses)
- [Base Mainnet](https://docs.base.org/base-chain/quickstart/base-solana-bridge#base-mainnet)
- [Solana Mainnet](https://docs.base.org/base-chain/quickstart/base-solana-bridge#solana-mainnet)
- [Base Sepolia](https://docs.base.org/base-chain/quickstart/base-solana-bridge#base-sepolia)
- [Solana Devnet](https://docs.base.org/base-chain/quickstart/base-solana-bridge#solana-devnet)
- [Resources](https://docs.base.org/base-chain/quickstart/base-solana-bridge#resources)
- [Discord SupportGet help from the Base community](https://base.org/discord)
