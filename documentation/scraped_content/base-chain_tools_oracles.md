# Oracles - Base Documentation

**Source:** https://docs.base.org/base-chain/tools/oracles
**Scraped:** 2026-02-04T10:27:17.703069

---

## Table of Contents

  - ​API3
  - ​Chainlink
  - ​Chronicle
  - ​DIA
  - ​Gelato
  - ​ORA
  - ​Orochi Network’s Orocle Service
    - ​Ready to build?
  - ​Pyth
    - ​Pyth Price Feeds Features:
    - ​Pyth Entropy
  - ​RedStone
  - ​Supra

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationToolsOraclesGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubStatusChain StatsExplorerSupportBlogQuickstartWhy Base?Deploy on BaseConnecting to BaseBase-Mainnet BridgeBase-Solana BridgeNetwork InformationBase ContractsEcosystem ContractsNetwork FeesBlock BuildingTransaction FinalityDifferences: Ethereum & BaseTroubleshooting TransactionsConfiguration ChangelogFlashblocksAppsNode ProvidersFlashblocks FAQNode OperatorsGetting StartedPerformance TuningSnapshotsTroubleshootingBuilder CodesBase Builder CodesBuilder Codes FAQToolsBase ProductsOnchain Registry APINode ProvidersBlock ExplorersNetwork FaucetsOraclesUser OnboardingData IndexersCross-chainAccount AbstractionOnrampsTokens in Coinbase WalletSecuritySecurity Council for BaseAvoid Malicious FlagsReport a VulnerabilityOn this pageAPI3ChainlinkChronicleDIAGelatoORAOrochi Network’s Orocle ServiceReady to build?PythPyth Price Feeds Features:Pyth EntropyRedStoneSupra​API3
The API3 Market provides access to 200+ price feeds on Base Mainnet and Base Testnet. The price feeds operate as a native push oracle and can be activated instantly via the Market UI.
The price feeds are delivered by an aggregate of first-party oracles using signed data and support OEV recapture.
Unlike traditional data feeds, reading API3 price feeds enables dApps to auction off the right to update the price feeds to searcher bots which facilitates more efficient liquidation processes for users and LPs of DeFi money markets. The OEV recaptured is returned to the dApp.
Apart from data feeds, API3 also provides Quantum Random Number Generation on Base Mainnet and Testnet. QRNG is a free-to-use service that provides quantum randomness onchain. It is powered by Airnode, the first-party oracle that is directly operated by the QRNG API providers. Read more about QRNG here.
Check out these guides to learn more:

dAPIs: First-party aggregated data feeds sourced directly from the data providers.
Airnode: The first-party serverless Oracle solution to bring any REST API onchain.
QRNG: Quantum Random Number Generator for verifiable quantum RNG onchain.

Supported Networks

Base Mainnet
Base Sepolia (Testnet)

​Chainlink
Chainlink provides a number of price feeds for Base.
See this guide to learn how to use the Chainlink feeds.
To use Chainlink datafeeds, you may need LINK token.
Supported Networks

Base Mainnet
Base Sepolia (Testnet)

​Chronicle
Chronicle provides a number of Oracles for Base.
See this guide to learn how to use the Chronicle Oracles.
Supported Networks

Base Mainnet
Base Sepolia (Testnet)

​DIA
DIA provides 2000+ price feeds for Base.
See this guide to learn how to use the DIA feeds.
Supported Networks

Base Mainnet
Base Sepolia (Testnet)

​Gelato
Gelato VRF (Verifiable Random Function) provides a unique system offering trustable randomness on Base.
See this guide to learn how to get started with Gelato VRF.
Supported Networks

Base Mainnet
Base Sepolia (Testnet)

​ORA
ORA provides an Onchain AI Oracle for Base.
See this guide to learn how to use ORA Onchain AI Oracle.
Supported Networks

Base Mainnet

​Orochi Network’s Orocle Service
Orochi Network’s Orocle provides a decentralized way for DApps to access real-world data without relying on centralized oracles.

Eliminates single points of failure.
Ensures data accuracy and verification.
Supports secure integration with external data sources.

​Ready to build?
Explore the documentation:

Orochi Network Orocle V2
Generate API: Orocle V2 Dashboard

Supported Networks

Base Mainnet
Base Sepolia (Testnet)

​Pyth
The Pyth Network is one of the largest first-party Oracle network, delivering real-time data across a vast number of chains. Pyth introduces an innovative low-latency pull oracle design, where users can pull price updates onchain when needed, enabling everyone in the onchain environment to access that data point most efficiently. Pyth network updates the prices every 400ms, making Pyth one of the fastest onchain oracles.
​Pyth Price Feeds Features:

400ms latency
Efficient and cost-effective Oracle
First-party data sourced directly from financial institutions
Price feeds ranging from Crypto, Stock, FX, Metals
Available on all major chains

Supported Networks for Base (Pyth Price Feeds):

Base Mainnet: 0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a
Base Sepolia: 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729

​Pyth Entropy
Pyth Entropy allows developers to quickly and easily generate secure random numbers onchain.
Check how to generate random numbers in EVM contracts for a detailed walkthrough.
Supported Networks for Base (Pyth Entropy):

Base Mainnet: 0x6E7D74FA7d5c90FEF9F0512987605a6d546181Bb
Base Sepolia: 0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c

Check out the following links to get started with Pyth.

Pyth Price Feed EVM Integration Guide
Pyth Docs
Pyth Price Feed API Reference
Pyth Examples
Website
Twitter

​RedStone
RedStone provides 1200+ price feeds for Base.
See this guide to learn how to use the RedStone feeds.
Supported Networks

Base Mainnet

​Supra
Supra provides VRF and decentralized oracle price feeds that can be used for onchain and offchain use-cases such as spot and perpetual DEXes, lending protocols, and payments protocols. Supra’s oracle chain and consensus algorithm makes it one of the fastest-to-finality oracle providers, with layer-1 security guarantees. The pull oracle has a sub-second response time. Aside from speed and security, Supra’s rotating node architecture gathers data from 40+ data sources and applies a robust calculation methodology to get the most accurate value. The node provenance on the data dashboard also provides a fully transparent historical audit trail. Supra’s Distributed Oracle Agreement (DORA) paper was accepted into ICDCS 2023, the oldest distributed systems conference.
Visit the Supra documentation to learn more about integrating Supra’s oracle and VRF into your Base project.
Supported Networks

Base Mainnet
Base Sepolia (Testnet)
Was this page helpful?YesNoSuggest editsRaise issueNetwork FaucetsPreviousUser OnboardingNext⌘I

---

## Related Links

- [Skip to main content](https://docs.base.org/base-chain/tools/oracles#content-area)
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
- [API3](https://docs.base.org/base-chain/tools/oracles#api3)
- [Chainlink](https://docs.base.org/base-chain/tools/oracles#chainlink)
- [Chronicle](https://docs.base.org/base-chain/tools/oracles#chronicle)
- [DIA](https://docs.base.org/base-chain/tools/oracles#dia)
- [Gelato](https://docs.base.org/base-chain/tools/oracles#gelato)
- [ORA](https://docs.base.org/base-chain/tools/oracles#ora)
- [Orochi Network’s Orocle Service](https://docs.base.org/base-chain/tools/oracles#orochi-network%E2%80%99s-orocle-service)
- [Ready to build?](https://docs.base.org/base-chain/tools/oracles#ready-to-build)
- [Pyth](https://docs.base.org/base-chain/tools/oracles#pyth)
- [Pyth Price Feeds Features:](https://docs.base.org/base-chain/tools/oracles#pyth-price-feeds-features)
- [Pyth Entropy](https://docs.base.org/base-chain/tools/oracles#pyth-entropy)
- [RedStone](https://docs.base.org/base-chain/tools/oracles#redstone)
- [Supra](https://docs.base.org/base-chain/tools/oracles#supra)
- [​](https://docs.base.org/base-chain/tools/oracles#orochi-network’s-orocle-service)
