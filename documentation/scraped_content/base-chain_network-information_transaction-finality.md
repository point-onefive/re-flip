# Transaction Finality - Base Documentation

**Source:** https://docs.base.org/base-chain/network-information/transaction-finality
**Scraped:** 2026-02-04T10:27:13.300868

---

## Table of Contents

  - ​What is transaction finality?
  - ​Finality for Base L2 Transactions
    - Flashblock Inclusion: ~200ms
    - L2 Block Inclusion: ~2s
    - L1 Batch Inclusion: ~2m
    - L1 Batch Finality: ~20m
  - ​Finality for Withdrawal Transactions
  - ​FAQ

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationNetwork InformationTransaction FinalityGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubStatusChain StatsExplorerSupportBlogQuickstartWhy Base?Deploy on BaseConnecting to BaseBase-Mainnet BridgeBase-Solana BridgeNetwork InformationBase ContractsEcosystem ContractsNetwork FeesBlock BuildingTransaction FinalityDifferences: Ethereum & BaseTroubleshooting TransactionsConfiguration ChangelogFlashblocksAppsNode ProvidersFlashblocks FAQNode OperatorsGetting StartedPerformance TuningSnapshotsTroubleshootingBuilder CodesBase Builder CodesBuilder Codes FAQToolsBase ProductsOnchain Registry APINode ProvidersBlock ExplorersNetwork FaucetsOraclesUser OnboardingData IndexersCross-chainAccount AbstractionOnrampsTokens in Coinbase WalletSecuritySecurity Council for BaseAvoid Malicious FlagsReport a VulnerabilityOn this pageWhat is transaction finality?Finality for Base L2 TransactionsFinality for Withdrawal TransactionsFAQ​What is transaction finality?
Finality refers to the point at which a transaction sent to Base becomes irreversible. This provides guarantees that the transaction will not be rolled back or lost.
Finality works differently for normal transactions that modify Base L2 state than it does for transactions that withdraw funds from Base L2 to Ethereum L1.
Only transactions that withdraw funds from Base to Ethereum must wait 7 days. Regular transactions within Base, such as swaps or sends, do not have to wait 7 days.
​Finality for Base L2 Transactions
This describes finality for transactions on Base except withdrawal transactions that move funds from Base to Ethereum L1
For transactions on Base, finality is not a single time to wait for. Instead, there are 4 stages in time that each provide increasing security guarantees.

1Flashblock Inclusion: ~200msAfter roughly 200ms, the transaction is included in a preconfirmation block (Flashblock) by the Base sequencer.Under 0.001% probability of a reorg.
Flashblocks reorg less than 0.001% of the time
You can see the reorg history in our public stats page.
2L2 Block Inclusion: ~2sAfter roughly 2 seconds, the sequencer has built the transaction into an L2 block and distributed it to validator nodes.Near 0% probability of a reorg.
Only a single Base L2 block has ever reorged, representing .0000003% of transactions. The data can be seen here
3L1 Batch Inclusion: ~2mAfter roughly 2 minutes, a Base batch containing the transaction has been posted to Ethereum.Effectively 0% probability of a reorg.
There has never been a reorg of L2 blocks that were batched to Ethereum L1.
A reorg of Ethereum L1 does not require a reorg of the Base L2 chain. The sequencer and validator nodes maintain a configurable lag from the tip of Ethereum, so typical L1 reorgs have no effect. In the event of larger Ethereum reorgs, Base can resubmit batch data on L1 without changing the sequenced L2 blocks.
4L1 Batch Finality: ~20mThe Ethereum L1 batch containing the transaction is older than 2 epochs, or 64 L1 blocks.Effectively 0% probability of a reorg.
L2 blocks that have reached L1 batch finality are protected from reorgs the same way Ethereum finalized blocks are. They are in practice impossible to reverse.

​Finality for Withdrawal Transactions
This describes finality of transactions that move funds from Base to Ethereum
Only withdrawals to Ethereum must wait 7 days to finalize before the funds can be released to the address on Ethereum L1. This allows Base’s Fault Proof system to provide extremely high security guarantees for funds bridged to Base.
What happens during the 7 days?When a transaction initiates a withdrawal from Base to Ethereum, the funds are removed from the account balance on Base. Later, a permissionless “proposer” must provide Ethereum with proof that Base contains this withdrawal.However, Ethereum cannot natively confirm what happened on Base as they are separate blockchains. Thus, there is a 7 day window in which a permissionless “challenger” can dispute a proposal that it feels is malicious. If no challenge is made in the 7 days, the withdrawal can be proven against the finalized output root and released to the L1 recipient. But if a challenge is made, the proposer and challenger play what is called the Fault Dispute Game. This game requires increasing bonds to be made, with an eventual winner. If the proposer wins, the output root finalizes and can be used to prove withdrawals against (releasing them on L1). If the challenger wins, the output proposal becomes invalid.This system requires only a one honest party to remain secure. Base will always run an honest proposer and challenger.Note: if the dispute game is won by a challenger, the state of the L2 chain does not reorg. The output proposal is marked invalid and any withdrawals that were proven against it cannot finalize. Those withdrawals would need to be re-proven against a different, valid output root.
​FAQ
If there is a reorg on Ethereum, will it cause a reorg on Base?In almost all circumstances, no. Base can simply re-submit batch data to Ethereum transparently while the L2 chain continues to progress.How long do deposit transactions take to finalize?Transactions moving funds from Ethereum L1 to Base must be initiated on Ethereum and typically get included within 3 minutes by the Base sequencer.If a challenger wins a dispute game, will the L2 chain reorg?No. The output proposal that was challenged is marked invalid, and any actions that used it’s output root become invalid. Specifically, withdrawals from Base to L1 that proved against this output root must now prove against a different and valid one.Was this page helpful?YesNoSuggest editsRaise issueBlock BuildingPreviousDifferences between Ethereum and BaseNext⌘I

---

## Related Links

- [Skip to main content](https://docs.base.org/base-chain/network-information/transaction-finality#content-area)
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
- [What is transaction finality?](https://docs.base.org/base-chain/network-information/transaction-finality#what-is-transaction-finality)
- [Finality for Base L2 Transactions](https://docs.base.org/base-chain/network-information/transaction-finality#finality-for-base-l2-transactions)
- [Finality for Withdrawal Transactions](https://docs.base.org/base-chain/network-information/transaction-finality#finality-for-withdrawal-transactions)
- [FAQ](https://docs.base.org/base-chain/network-information/transaction-finality#faq)
- [public stats page.](https://base.org/stats)
