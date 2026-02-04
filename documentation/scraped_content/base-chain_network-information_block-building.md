# Block Building - Base Documentation

**Source:** https://docs.base.org/base-chain/network-information/block-building
**Scraped:** 2026-02-04T10:27:05.214479

---

## Table of Contents

  - ​Overview
  - ​Configurations
    - ​Flashblocks
      - ​Timing
      - ​High Gas Limits
    - ​Per-Transaction Gas Maximum
    - ​Vanilla

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationNetwork InformationBlock BuildingGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubStatusChain StatsExplorerSupportBlogQuickstartWhy Base?Deploy on BaseConnecting to BaseBase-Mainnet BridgeBase-Solana BridgeNetwork InformationBase ContractsEcosystem ContractsNetwork FeesBlock BuildingTransaction FinalityDifferences: Ethereum & BaseTroubleshooting TransactionsConfiguration ChangelogFlashblocksAppsNode ProvidersFlashblocks FAQNode OperatorsGetting StartedPerformance TuningSnapshotsTroubleshootingBuilder CodesBase Builder CodesBuilder Codes FAQToolsBase ProductsOnchain Registry APINode ProvidersBlock ExplorersNetwork FaucetsOraclesUser OnboardingData IndexersCross-chainAccount AbstractionOnrampsTokens in Coinbase WalletSecuritySecurity Council for BaseAvoid Malicious FlagsReport a VulnerabilityOn this pageOverviewConfigurationsFlashblocksTimingHigh Gas LimitsPer-Transaction Gas MaximumVanilla​Overview
This section describes how blocks are ordered on the Base networks. The ordering is separate from the UX,
for example the sequencer could be building Flashblocks every 200ms, without these Flashblocks being exposed publicly. In this scenario, block ordering
would change but the user experience would remain consistent.
The Base networks are currently configured in the following ways:
NetworkCurrent ConfigurationUpcoming DeploymentsBase MainnetFlashblocks + Per-Transaction Gas MaxBase SepoliaFlashblocks + Per-Transaction Gas Max
See the Configuration Changelog for a history of changes to block building and other network parameters.
​Configurations
​Flashblocks
Currently, blocks are built using op-rbuilder and priority fee auctions occur
every 200ms. There are two changes from the vanilla ordering to be aware of:
​Timing
Flashblocks are built every 200ms, each ordering a portion of the block. Unlike the current system where later-arriving transactions with higher priority fees can be placed at the top of the block, Flashblocks creates a time-based constraint. Once a Flashblock is built and broadcast, its transaction ordering is locked even if a transaction with a higher priority fee arrives later, it cannot be included in earlier, already built Flashblocks.
​High Gas Limits
If your app creates transactions with large gas limits, we recommend monitoring to detect any changes in inclusion latency. Transactions with gas limits over 1/10 of the current block gas limit (currently 14 million gas), face additional constraints:

Each Flashblock can only use a portion of the block’s total gas limit
Flashblock 1: up to 1/10 of the total gas
Flashblock 2: up to 2/10 of the total gas

And so on for subsequent Flashblocks
Consequently, transactions with large gas requirements must wait for later Flashblocks with sufficient gas capacity. For example, a transaction exceeding 1/10 of the block’s gas limit cannot be included in Flashblock 1 and must wait for Flashblock 2 or later.
​Per-Transaction Gas Maximum
Base enforces a per-transaction gas maximum of 25,000,000 gas. Transactions that specify a gas limit above this value are rejected by the mempool before inclusion. eth_sendTransaction or eth_sendRawTransaction will return a JSON-RPC error (for example: exceeds maximum per-transaction gas limit). This cap does not change the block gas limit or the block validity conditions.
Fusaka’s EIP 7825 will change the block validity conditions and enforce a lower per-transaction gas maximum of 16,777,216 gas (2^24). We expect this protocol change to be adopted in all OP Stack chains around January 2026.
Bundler operators for smart contract wallets must configure their systems to limit the bundle size to fit within this cap.
​Vanilla
Blocks are built every 2s by op-geth. Transactions within those blocks are ordered by
priority fee, see the (code).Was this page helpful?YesNoSuggest editsRaise issueNetwork FeesPreviousTransaction FinalityNext⌘I

---

## Related Links

- [Skip to main content](https://docs.base.org/base-chain/network-information/block-building#content-area)
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
- [Overview](https://docs.base.org/base-chain/network-information/block-building#overview)
- [Configurations](https://docs.base.org/base-chain/network-information/block-building#configurations)
- [Flashblocks](https://docs.base.org/base-chain/network-information/block-building#flashblocks)
- [Timing](https://docs.base.org/base-chain/network-information/block-building#timing)
- [High Gas Limits](https://docs.base.org/base-chain/network-information/block-building#high-gas-limits)
- [Per-Transaction Gas Maximum](https://docs.base.org/base-chain/network-information/block-building#per-transaction-gas-maximum)
- [Vanilla](https://docs.base.org/base-chain/network-information/block-building#vanilla)
