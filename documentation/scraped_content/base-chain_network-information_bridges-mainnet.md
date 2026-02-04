# Bridges - Base Documentation

**Source:** https://docs.base.org/base-chain/network-information/bridges-mainnet
**Scraped:** 2026-02-04T10:27:30.426687

---

## Table of Contents

  - ​Ethereum ↔ Base
    - ​Superbridge
      - ​Supported Networks
    - ​Brid.gg
      - ​Supported Networks
    - ​Programmatic Bridging (Ethereum)
    - ​For Token Issuers
  - ​Solana ↔ Base
  - Full Documentation
  - Terminally Onchain
    - ​Contract Addresses
  - ​Bitcoin → Base
    - ​Garden
      - ​Supported Networks
  - ​Disclaimer
  - ​FAQ

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationBridgesGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnQuickstartWhy Base?Deploy on BaseConnecting to BaseBase-Mainnet BridgeBase-Solana BridgeNetwork InformationBase ContractsEcosystem ContractsNetwork FeesBlock BuildingTransaction FinalityDifferences: Ethereum & BaseTroubleshooting TransactionsConfiguration ChangelogFlashblocksAppsNode ProvidersFlashblocks FAQNode OperatorsGetting StartedPerformance TuningSnapshotsTroubleshootingBuilder CodesBase Builder CodesBuilder Codes FAQToolsBase ProductsOnchain Registry APINode ProvidersBlock ExplorersNetwork FaucetsOraclesUser OnboardingData IndexersCross-chainAccount AbstractionOnrampsTokens in Coinbase WalletSecuritySecurity Council for BaseAvoid Malicious FlagsReport a VulnerabilityOn this pageEthereum ↔ BaseSuperbridgeSupported NetworksBrid.ggSupported NetworksProgrammatic Bridging (Ethereum)For Token IssuersSolana ↔ BaseContract AddressesBitcoin → BaseGardenSupported NetworksDisclaimerFAQBase supports bridging assets from multiple chains including Ethereum, Solana, and Bitcoin. While the bridge on bridge.base.org has been deprecated, there are many bridges that support moving assets between Base and other chains.
For questions, see our FAQ.

​Ethereum ↔ Base
​Superbridge
Superbridge enables you to bridge ETH and other supported assets from Ethereum mainnet (L1) directly to Base.
​Supported Networks

Base Mainnet
Base Sepolia (Testnet)

​Brid.gg
Brid.gg is another option that also helps you bridge ETH and supported assets between Ethereum mainnet (L1) and Base.
​Supported Networks

Base Mainnet
Base Sepolia (Testnet)

​Programmatic Bridging (Ethereum)
See the sample code repository to see how to bridge ETH and ERC-20s from Ethereum to Base.
Double check the token address for ERC-20s You can use any ERC-20 that is
supported on the network. You can check what assets are on Base and the
corresponding contract address via this hub.
Ensure there is an address for base, example.
Always test with small amounts to ensure the system is working as expected.
This implementation can only bridge assets to Base. Do not attempt to alter the
code to withdraw the assets.
​For Token Issuers
If you have an ERC-20 token deployed on Ethereum and want to enable bridging to Base, see our guide on Bridging an L1 Token to Base. This covers deploying your token on Base using the standard bridge contracts and getting it listed on the Superchain token list.

​Solana ↔ Base
The Base-Solana bridge enables bidirectional token transfers and message passing between Base and Solana networks.
Key Features:

Transfer SOL and SPL tokens between Base and Solana
Send arbitrary cross-chain messages
Deploy wrapped tokens on either chain
Optional auto-relay for instant execution

Full DocumentationComplete guide with code examples and contract addressesTerminally OnchainProduction terminal UI for bridging + contract calls
​Contract Addresses
NetworkContractAddressBase MainnetBridge0x3eff766C76a1be2Ce1aCF2B69c78bCae257D5188Base MainnetSOL Token0x311935Cd80B76769bF2ecC9D8Ab7635b2139cf82Solana MainnetBridge ProgramHNCne2FkVaNghhjKXapxJzPaBvAKDG1Ge3gqhZyfVWLM
For testnet addresses and full implementation details, see the Base-Solana Bridge documentation.

​Bitcoin → Base
​Garden
Garden is a fast non-custodial Bitcoin bridge that enables you to bridge BTC and other supported assets from Ethereum, Solana, and more, directly to Base.
​Supported Networks

Base Mainnet
Base Sepolia (Testnet)

​Disclaimer
Coinbase Technologies, Inc., provides links to these independent service providers for your
convenience but assumes no responsibility for their operations. Any interactions with these
providers are solely between you and the provider.

​FAQ
Can I still use the bridge on bridge.base.org?No, the bridge on bridge.base.org has been deprecated.
I used bridge.base.org in the past, how do I find my deposit or withdrawal?Navigate to one of the Superchain Bridges to look up your transaction.
Why has Base deprecated the bridge on bridge.base.org?Base is committed to decentralization and the Superchain vision. Leveraging the community to bootstrap the Superchain bridges is a step in that direction; increasing censorship resistance and decentralization.
Who operates the Superchain Bridges like Garden.finance, Superbridge.app and Brid.gg?Superchain Bridges are operated by third parties, not by Coinbase Technologies, Inc. (“Coinbase”). Coinbase does not control, operate, or assume any responsibility for the performance of these external platforms. Before using any Superchain Bridge, you may be required to agree to their terms and conditions. We strongly recommend you review these terms carefully, as well as any privacy policies, to understand your rights and obligations. The integration or inclusion of the Superchain Bridges does not imply an endorsement or recommendation of any bridge by Coinbase.
How does the Base-Solana bridge work?The Base-Solana bridge uses validators to verify cross-chain messages. When bridging from Solana to Base, tokens are locked on Solana and minted on Base. When bridging from Base to Solana, tokens are burned on Base and unlocked on Solana. See the full documentation for implementation details.
What if I have a question, issue, or problem?The Base Discord community is available around the clock for general questions,
assistance and support! You can create a support ticket in the #general-support
channel.Was this page helpful?YesNoSuggest editsRaise issue⌘I

---

## Related Links

- [Skip to main content](https://docs.base.org/base-chain/network-information/bridges-mainnet#content-area)
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
- [Ethereum ↔ Base](https://docs.base.org/base-chain/network-information/bridges-mainnet#ethereum--base)
- [Superbridge](https://docs.base.org/base-chain/network-information/bridges-mainnet#superbridge)
- [Supported Networks](https://docs.base.org/base-chain/network-information/bridges-mainnet#supported-networks)
- [Brid.gg](https://docs.base.org/base-chain/network-information/bridges-mainnet#brid-gg)
- [Supported Networks](https://docs.base.org/base-chain/network-information/bridges-mainnet#supported-networks-2)
- [Programmatic Bridging (Ethereum)](https://docs.base.org/base-chain/network-information/bridges-mainnet#programmatic-bridging-ethereum)
- [For Token Issuers](https://docs.base.org/base-chain/network-information/bridges-mainnet#for-token-issuers)
- [Solana ↔ Base](https://docs.base.org/base-chain/network-information/bridges-mainnet#solana--base)
- [Contract Addresses](https://docs.base.org/base-chain/network-information/bridges-mainnet#contract-addresses)
- [Bitcoin → Base](https://docs.base.org/base-chain/network-information/bridges-mainnet#bitcoin-%E2%86%92-base)
- [Garden](https://docs.base.org/base-chain/network-information/bridges-mainnet#garden)
- [Supported Networks](https://docs.base.org/base-chain/network-information/bridges-mainnet#supported-networks-3)
- [Disclaimer](https://docs.base.org/base-chain/network-information/bridges-mainnet#disclaimer)
- [FAQ](https://docs.base.org/base-chain/network-information/bridges-mainnet#faq)
- [sample code repository](https://github.com/base-org/guides/tree/main/bridge/native)
- [Base-Solana Bridge documentation](https://docs.base.org/base-chain/quickstart/base-solana-bridge#contract-addresses)
- [​](https://docs.base.org/base-chain/network-information/bridges-mainnet#bitcoin-→-base)
- [Base Discord](https://base.org/discord)
