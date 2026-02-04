# How to avoid getting your app flagged as malicious - Base Documentation

**Source:** https://docs.base.org/base-chain/security/avoid-malicious-flags
**Scraped:** 2026-02-04T10:27:10.303396

---

## Table of Contents

  - ​1. Verify and reduce the risk of your smart contract
  - ​2. Submit a verification request
  - ​3. Follow app best practices

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationSecurityHow to avoid getting your app flagged as maliciousGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubStatusChain StatsExplorerSupportBlogQuickstartWhy Base?Deploy on BaseConnecting to BaseBase-Mainnet BridgeBase-Solana BridgeNetwork InformationBase ContractsEcosystem ContractsNetwork FeesBlock BuildingTransaction FinalityDifferences: Ethereum & BaseTroubleshooting TransactionsConfiguration ChangelogFlashblocksAppsNode ProvidersFlashblocks FAQNode OperatorsGetting StartedPerformance TuningSnapshotsTroubleshootingBuilder CodesBase Builder CodesBuilder Codes FAQToolsBase ProductsOnchain Registry APINode ProvidersBlock ExplorersNetwork FaucetsOraclesUser OnboardingData IndexersCross-chainAccount AbstractionOnrampsTokens in Coinbase WalletSecuritySecurity Council for BaseAvoid Malicious FlagsReport a VulnerabilityOn this page1. Verify and reduce the risk of your smart contract2. Submit a verification request3. Follow app best practicesEnsuring that your app is perceived as trustworthy and not flagged as malicious requires attention to best practices. Here’s a quick guide on how to build a secure and compliant app from day one.
​1. Verify and reduce the risk of your smart contract

Verify Smart Contract: Ensure that the source code of your contracts is verified and publicly available on block explorers. For example, this can be done on Etherscan and Basescan under “Verify Contract”.
Limit Exposure of User Funds: Design your contracts to minimize the exposure of user funds. Use efficient design to reduce any unnecessary risk. For example, request the minimum amount needed to fulfill the transaction.

​2. Submit a verification request
After verifying your smart contract, consider submitting a verification request. This step helps ensure that your app is recognized as safe and verified by trusted sources in the ecosystem.
​3. Follow app best practices

Accessibility Across Regions: Avoid geo-blocking or access restrictions that prevent certain regions or countries from accessing your app. Depending on legal or compliance reasons, this may be necessary which you can indicate in your verification request submission.
Consistent Behavior: Avoid rapid or unexplained changes in UI that can make users feel uncertain about the app’s reliability.
Transparent Onchain Interactions: Make sure your app’s onchain interactions are clear and match the UI actions. For example, a “Mint” button should clearly emit a mint transaction.
Standard Sign-in Methods: Provide all standard connection methods for users to sign in, such as WalletConnect / Coinbase Wallet SDK or popular browser extension wallets.
Audit Your Contracts: Have your contracts audited by a reputable firm. Publish the audit report and provide a reference link so users can easily find it. Audits show that you’ve taken extra steps to secure your smart contracts.

By following these recommendations, you’ll significantly reduce the chances of your app being flagged as malicious and foster a secure and trustworthy environment for your users.

Still having trouble?
Coinbase Wallet may report false positives when flagging apps. To avoid false positives, please make sure you have completed the recommended actions above. If your app is still flagged as suspicious or malicious, report it to Blockaid.
Was this page helpful?YesNoSuggest editsRaise issueSecurity Council for BasePreviousReporting VulnerabilitiesNext⌘I

---

## Related Links

- [Skip to main content](https://docs.base.org/base-chain/security/avoid-malicious-flags#content-area)
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
- [1. Verify and reduce the risk of your smart contract](https://docs.base.org/base-chain/security/avoid-malicious-flags#1-verify-and-reduce-the-risk-of-your-smart-contract)
- [2. Submit a verification request](https://docs.base.org/base-chain/security/avoid-malicious-flags#2-submit-a-verification-request)
- [3. Follow app best practices](https://docs.base.org/base-chain/security/avoid-malicious-flags#3-follow-app-best-practices)
