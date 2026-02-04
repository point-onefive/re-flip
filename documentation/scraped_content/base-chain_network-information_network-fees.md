# Network Fees - Base Documentation

**Source:** https://docs.base.org/base-chain/network-information/network-fees
**Scraped:** 2026-02-04T10:27:28.167936

---

## Table of Contents

- ​Fees
  - ​How do network fees on Base work?
  - ​Minimum Base Fee
    - ​Benefits
    - ​Current Configuration

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationNetwork InformationNetwork FeesGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubStatusChain StatsExplorerSupportBlogQuickstartWhy Base?Deploy on BaseConnecting to BaseBase-Mainnet BridgeBase-Solana BridgeNetwork InformationBase ContractsEcosystem ContractsNetwork FeesBlock BuildingTransaction FinalityDifferences: Ethereum & BaseTroubleshooting TransactionsConfiguration ChangelogFlashblocksAppsNode ProvidersFlashblocks FAQNode OperatorsGetting StartedPerformance TuningSnapshotsTroubleshootingBuilder CodesBase Builder CodesBuilder Codes FAQToolsBase ProductsOnchain Registry APINode ProvidersBlock ExplorersNetwork FaucetsOraclesUser OnboardingData IndexersCross-chainAccount AbstractionOnrampsTokens in Coinbase WalletSecuritySecurity Council for BaseAvoid Malicious FlagsReport a VulnerabilityOn this pageFeesHow do network fees on Base work?Minimum Base FeeBenefitsCurrent Configuration​Fees
​How do network fees on Base work?
Every Base transaction consists of two costs: an L2 (execution) fee and an L1
(security) fee. The L2 fee is the cost to execute your transaction on the L2,
and the L1 fee is the estimated cost to publish the transaction on the L1.
Typically the L1 security fee is higher than the L2 execution fee.
The L1 fee will vary depending on the amount of transactions on the L1. If the
timing of your transaction is flexible, you can save costs by submitting
transactions during periods of lower gas on the L1 (for example, over the
weekend)
Similarly, the L2 fee can increase and decrease depending on how many
transactions are being submitted to the L2. This adjustment mechanism has the
same implementation as the L1; you can read more about it
here.
For additional details about fee calculation on Base, please refer to the
op-stack developer
documentation.
​Minimum Base Fee
As part of the Jovian upgrade, Base introduced a minimum base fee. This feature sets a floor for the L2 base fee, preventing it from dropping to extremely low levels during periods of low network activity.
The minimum base fee for Base Mainnet is 2,000,000 wei (0.002 gwei). This value may be periodically adjusted as we gather data on how it affects the chain. For reference, a minimum base fee of 0.002 gwei results in a cost of approximately 0.001foratypical200,000gastransactionatanETHpriceof0.001 for a typical 200,000 gas transaction at an ETH price of 0.001foratypical200,000gastransactionatanETHpriceof2500.
​Benefits

Faster Transaction Inclusion: Previously, when low activity caused the base fee to drop very low, spikes in demand could lead to extended periods of congestion before fees rose enough to clear the backlog. With a minimum base fee, transactions are typically included more quickly without users needing to manually adjust priority fees.
More Predictable Fees: During normal operation, the base fee will remain at or near the minimum. During congestion, the base fee rises above the minimum. This creates a more predictable fee structure similar to surge pricing.
Spam Prevention: Extremely low fees can incentivize spam transactions that don’t provide value to the network. The minimum base fee helps price out such activity while keeping fees affordable for legitimate use.

​Current Configuration
NetworkMinimum Base FeeBase Mainnet2,000,000 wei (0.002 gwei)Base Sepolia200,000 wei (0.0002 gwei)
See the Configuration Changelog for a history of changes to the minimum base fee and other network parameters.Was this page helpful?YesNoSuggest editsRaise issueEcosystem ContractsPreviousBlock BuildingNext⌘I

---

## Related Links

- [Skip to main content](https://docs.base.org/base-chain/network-information/network-fees#content-area)
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
- [Fees](https://docs.base.org/base-chain/network-information/network-fees#fees)
- [How do network fees on Base work?](https://docs.base.org/base-chain/network-information/network-fees#how-do-network-fees-on-base-work)
- [Minimum Base Fee](https://docs.base.org/base-chain/network-information/network-fees#minimum-base-fee)
- [Benefits](https://docs.base.org/base-chain/network-information/network-fees#benefits)
- [Current Configuration](https://docs.base.org/base-chain/network-information/network-fees#current-configuration)
