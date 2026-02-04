# Bridging an L1 token to Base - Base Documentation

**Source:** https://docs.base.org/base-chain/quickstart/bridge-token
**Scraped:** 2026-02-04T10:27:23.006023

---

## Table of Contents

  - ​Adding your token to the list
    - ​Step 1: Deploy your token on Base
    - ​Step 2: Submit details for your token
    - ​Step 3: Await final approval

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationQuickstartBridging an L1 token to BaseGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubStatusChain StatsExplorerSupportBlogQuickstartWhy Base?Deploy on BaseConnecting to BaseBase-Mainnet BridgeBase-Solana BridgeNetwork InformationBase ContractsEcosystem ContractsNetwork FeesBlock BuildingTransaction FinalityDifferences: Ethereum & BaseTroubleshooting TransactionsConfiguration ChangelogFlashblocksAppsNode ProvidersFlashblocks FAQNode OperatorsGetting StartedPerformance TuningSnapshotsTroubleshootingBuilder CodesBase Builder CodesBuilder Codes FAQToolsBase ProductsOnchain Registry APINode ProvidersBlock ExplorersNetwork FaucetsOraclesUser OnboardingData IndexersCross-chainAccount AbstractionOnrampsTokens in Coinbase WalletSecuritySecurity Council for BaseAvoid Malicious FlagsReport a VulnerabilityOn this pageAdding your token to the listStep 1: Deploy your token on BaseStep 2: Submit details for your tokenStep 3: Await final approvalThis page is intended for token issuers who already have an ERC-20 contract deployed on Ethereum and would like to submit their token for bridging between Ethereum and Base. Base uses the Superchain token list as a reference for tokens that have been deployed on Base.
Disclaimer: Base does not endorse any of the tokens that are listed in the Github repository and has conducted only preliminary checks, which include automated checks listed here.
​Adding your token to the list
The steps below explain how to get your token on the Base Token List.
​Step 1: Deploy your token on Base
Select your preferred bridging framework and use it to deploy an ERC-20 for your token on Base. We recommend you use the framework provided by Base’s standard bridge contracts, and furthermore deploy your token using the OptimismMintableERC20Factory. You can find the list of contracts addresses here.
Deploying your token on Base in this manner provides us with guarantees that will smooth the approval process. If you choose a different bridging framework, its interface must be compatible with that of the standard bridge, otherwise it may be difficult for us to support.
​Step 2: Submit details for your token
Follow the instructions in the Github repository and submit a PR containing the required details for your token. You must specify in your token’s data.json file a section for ‘base-sepolia’ and/or ‘base’. The change you need to submit is particularly simple if your token has already been added to the Superchain token list. For example, this PR shows the change required for cbETH, which was already on Optimism’s token list and relies on the Base standard bridge.
​Step 3: Await final approval
Reviews are regularly conducted by the Base team and you should receive a reply within 24-72 hours (depending on if the PR is opened on a weekday, weekend or holiday).Was this page helpful?YesNoSuggest editsRaise issueConnecting to BasePreviousBase-Solana BridgeNext⌘I

---

## Related Links

- [Skip to main content](https://docs.base.org/base-chain/quickstart/bridge-token#content-area)
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
- [Adding your token to the list](https://docs.base.org/base-chain/quickstart/bridge-token#adding-your-token-to-the-list)
- [Step 1: Deploy your token on Base](https://docs.base.org/base-chain/quickstart/bridge-token#step-1-deploy-your-token-on-base)
- [Step 2: Submit details for your token](https://docs.base.org/base-chain/quickstart/bridge-token#step-2-submit-details-for-your-token)
- [Step 3: Await final approval](https://docs.base.org/base-chain/quickstart/bridge-token#step-3-await-final-approval)
