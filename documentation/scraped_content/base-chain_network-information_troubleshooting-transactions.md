# Troubleshooting Transactions - Base Documentation

**Source:** https://docs.base.org/base-chain/network-information/troubleshooting-transactions
**Scraped:** 2026-02-04T10:27:16.221775

---

## Table of Contents

  - ​Transaction Not Being Included
    - ​Max Fee Too Low
    - ​Priority Fee Too Low
    - ​Nonce Gap
    - ​Nonce Too Low
  - ​Transaction Rejected
    - ​Gas Limit Exceeds Maximum
  - ​Transaction Included But Failed
    - ​Out of Gas
    - ​Reverted by Contract
  - ​Slow Confirmation
    - ​Understanding Confirmation Times
    - ​Using Flashblocks for Faster Confirmations
  - ​Debugging Tools
  - ​Getting Help

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationNetwork InformationTroubleshooting TransactionsGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubStatusChain StatsExplorerSupportBlogQuickstartWhy Base?Deploy on BaseConnecting to BaseBase-Mainnet BridgeBase-Solana BridgeNetwork InformationBase ContractsEcosystem ContractsNetwork FeesBlock BuildingTransaction FinalityDifferences: Ethereum & BaseTroubleshooting TransactionsConfiguration ChangelogFlashblocksAppsNode ProvidersFlashblocks FAQNode OperatorsGetting StartedPerformance TuningSnapshotsTroubleshootingBuilder CodesBase Builder CodesBuilder Codes FAQToolsBase ProductsOnchain Registry APINode ProvidersBlock ExplorersNetwork FaucetsOraclesUser OnboardingData IndexersCross-chainAccount AbstractionOnrampsTokens in Coinbase WalletSecuritySecurity Council for BaseAvoid Malicious FlagsReport a VulnerabilityOn this pageTransaction Not Being IncludedMax Fee Too LowPriority Fee Too LowNonce GapNonce Too LowTransaction RejectedGas Limit Exceeds MaximumTransaction Included But FailedOut of GasReverted by ContractSlow ConfirmationUnderstanding Confirmation TimesUsing Flashblocks for Faster ConfirmationsDebugging ToolsGetting Help​Transaction Not Being Included
If your transaction is pending for longer than expected, check the following:
​Max Fee Too Low
If your maxFeePerGas is lower than the current base fee, your transaction will remain pending until the base fee drops to your specified level.
Solution: The maxFeePerGas must cover both the base fee and your priority fee. Since the base fee can change with each block, set maxFeePerGas high enough to remain valid even if the base fee rises while your transaction is pending. A common approach is:
Report incorrect codeCopyAsk AImaxFeePerGas = baseFee * 2 + maxPriorityFeePerGas

This formula (used by ethers.js) provides headroom for the base fee to double before your transaction becomes unexecutable. You only pay the actual base fee at inclusion time, not the maximum.
Base has a minimum base fee. Transactions with maxFeePerGas below this value will never be included, since the base fee cannot drop below the minimum.
​Priority Fee Too Low
During periods of high demand, transactions compete for block space through priority fees. If your priority fee is too low relative to other transactions, yours may be delayed.
Solution: Most users simply wait for congestion to subside. For time-sensitive transactions, use eth_maxPriorityFeePerGas to get a priority fee estimate that can outbid enough recent transactions to be included.
If DA throttling is currently in effect, there’s no RPC endpoint that calculates priority fee estimates with throttling in mind. During DA throttling, even transactions with high priority fees may be delayed as the sequencer limits L2 transactions to manage its L1 data availability throughput.
​Nonce Gap
If you have a pending transaction with nonce N, all transactions with nonce N+1 or higher will queue behind it, regardless of their fees.
Solution: Either wait for the pending transaction to be included, or replace it by submitting a new transaction with the same nonce and a higher fee (at least 10% higher maxPriorityFeePerGas and maxFeePerGas).
​Nonce Too Low
If you submit a transaction with a nonce that has already been used, it will be rejected.
Solution: Query your current nonce using eth_getTransactionCount with the pending tag to get the next available nonce.
​Transaction Rejected
​Gas Limit Exceeds Maximum
Ethereum enforces a transaction gas limit cap of 16,777,216 gas. Base plans to match this limit in a future upgrade, but currently enforces a per-transaction gas maximum of 25,000,000 gas. Transactions specifying a higher gas limit are rejected by the mempool before inclusion.
Error: exceeds maximum per-transaction gas limit
Solution: Reduce the gas limit to 16,777,216 or below. If your transaction genuinely requires more gas, you’ll need to break it into multiple transactions.
​Transaction Included But Failed
If your transaction was included in a block but shows a failed status:
​Out of Gas
The transaction ran out of gas during execution.
Solution: Increase the gas limit. Use eth_estimateGas to get a gas estimate, then add a buffer (e.g., 20%) to account for variability.
​Reverted by Contract
The contract execution encountered a revert condition.
Solution: Check the transaction on Basescan to see the revert reason. Common causes include failed require statements, arithmetic errors, or invalid state transitions.
​Slow Confirmation
​Understanding Confirmation Times
Base produces blocks every 2 seconds, but Flashblocks provide preconfirmations every 200ms.
Confirmation LevelTimeDescriptionFlashblock preconfirmation~200msTransaction included in a preconfirmationL2 block inclusion~2sTransaction included in a sealed L2 blockL1 batch inclusion~2mTransaction posted to EthereumL1 finality~20mEthereum batch is finalized
See Transaction Finality for more details.
​Using Flashblocks for Faster Confirmations
To get the fastest possible confirmation, use a Flashblocks-aware RPC endpoint:
NetworkFlashblocks RPCMainnethttps://mainnet-preconf.base.orgSepoliahttps://sepolia-preconf.base.org
These endpoints return transaction receipts as soon as a transaction is included in a Flashblock, rather than waiting for the full L2 block.
​Debugging Tools

Basescan: View transaction status, logs, and revert reasons
Tenderly: Simulate and debug transactions
eth_call: Test contract calls without submitting a transaction
eth_estimateGas: Estimate gas usage before submitting

​Getting Help
If you’re still experiencing issues, reach out in the #developer-chat channel in the Base Discord.Was this page helpful?YesNoSuggest editsRaise issueDifferences between Ethereum and BasePreviousConfiguration ChangelogNext⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
maxFeePerGas = baseFee * 2 + maxPriorityFeePerGas
```

---

## Related Links

- [Skip to main content](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#content-area)
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
- [Transaction Not Being Included](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#transaction-not-being-included)
- [Max Fee Too Low](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#max-fee-too-low)
- [Priority Fee Too Low](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#priority-fee-too-low)
- [Nonce Gap](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#nonce-gap)
- [Nonce Too Low](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#nonce-too-low)
- [Transaction Rejected](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#transaction-rejected)
- [Gas Limit Exceeds Maximum](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#gas-limit-exceeds-maximum)
- [Transaction Included But Failed](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#transaction-included-but-failed)
- [Out of Gas](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#out-of-gas)
- [Reverted by Contract](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#reverted-by-contract)
- [Slow Confirmation](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#slow-confirmation)
- [Understanding Confirmation Times](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#understanding-confirmation-times)
- [Using Flashblocks for Faster Confirmations](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#using-flashblocks-for-faster-confirmations)
- [Debugging Tools](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#debugging-tools)
- [Getting Help](https://docs.base.org/base-chain/network-information/troubleshooting-transactions#getting-help)
- [minimum base fee](https://docs.base.org/base-chain/network-information/network-fees#minimum-base-fee)
- [per-transaction gas maximum](https://docs.base.org/base-chain/network-information/block-building#per-transaction-gas-maximum)
- [Base Discord](https://base.org/discord)
