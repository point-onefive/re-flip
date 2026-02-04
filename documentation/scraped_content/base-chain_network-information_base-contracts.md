# Contract Addresses - Base Documentation

**Source:** https://docs.base.org/base-chain/network-information/base-contracts
**Scraped:** 2026-02-04T10:27:00.217749

---

## Table of Contents

  - ​L2 Contract Addresses
    - ​Base Mainnet
    - ​Base Testnet (Sepolia)
  - ​L1 Contract Addresses
    - ​Ethereum Mainnet
    - ​Ethereum Testnet (Sepolia)
  - ​Base Admin Addresses
    - ​Base Mainnet
    - ​Base Testnet (Sepolia)

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationNetwork InformationContract AddressesGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubStatusChain StatsExplorerSupportBlogQuickstartWhy Base?Deploy on BaseConnecting to BaseBase-Mainnet BridgeBase-Solana BridgeNetwork InformationBase ContractsEcosystem ContractsNetwork FeesBlock BuildingTransaction FinalityDifferences: Ethereum & BaseTroubleshooting TransactionsConfiguration ChangelogFlashblocksAppsNode ProvidersFlashblocks FAQNode OperatorsGetting StartedPerformance TuningSnapshotsTroubleshootingBuilder CodesBase Builder CodesBuilder Codes FAQToolsBase ProductsOnchain Registry APINode ProvidersBlock ExplorersNetwork FaucetsOraclesUser OnboardingData IndexersCross-chainAccount AbstractionOnrampsTokens in Coinbase WalletSecuritySecurity Council for BaseAvoid Malicious FlagsReport a VulnerabilityOn this pageL2 Contract AddressesBase MainnetBase Testnet (Sepolia)L1 Contract AddressesEthereum MainnetEthereum Testnet (Sepolia)Base Admin AddressesBase MainnetBase Testnet (Sepolia)​L2 Contract Addresses
​Base Mainnet
NameAddressWETH90x4200000000000000000000000000000000000006L2CrossDomainMessenger0x4200000000000000000000000000000000000007L2StandardBridge0x4200000000000000000000000000000000000010SequencerFeeVault0x4200000000000000000000000000000000000011OptimismMintableERC20Factory0xF10122D428B4bc8A9d050D06a2037259b4c4B83BGasPriceOracle0x420000000000000000000000000000000000000FL1Block0x4200000000000000000000000000000000000015L2ToL1MessagePasser0x4200000000000000000000000000000000000016L2ERC721Bridge0x4200000000000000000000000000000000000014OptimismMintableERC721Factory0x4200000000000000000000000000000000000017ProxyAdmin0x4200000000000000000000000000000000000018BaseFeeVault0x4200000000000000000000000000000000000019L1FeeVault0x420000000000000000000000000000000000001aEAS0x4200000000000000000000000000000000000021EASSchemaRegistry0x4200000000000000000000000000000000000020LegacyERC20ETH0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000
​Base Testnet (Sepolia)
NameAddressWETH90x4200000000000000000000000000000000000006L2CrossDomainMessenger0x4200000000000000000000000000000000000007L2StandardBridge0x4200000000000000000000000000000000000010SequencerFeeVault0x4200000000000000000000000000000000000011OptimismMintableERC20Factory0x4200000000000000000000000000000000000012GasPriceOracle0x420000000000000000000000000000000000000FL1Block0x4200000000000000000000000000000000000015L2ToL1MessagePasser0x4200000000000000000000000000000000000016L2ERC721Bridge0x4200000000000000000000000000000000000014OptimismMintableERC721Factory0x4200000000000000000000000000000000000017ProxyAdmin0x4200000000000000000000000000000000000018BaseFeeVault0x4200000000000000000000000000000000000019L1FeeVault0x420000000000000000000000000000000000001aEAS0x4200000000000000000000000000000000000021EASSchemaRegistry0x4200000000000000000000000000000000000020LegacyERC20ETH0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000
*L2 contract addresses are the same on both mainnet and testnet.
​L1 Contract Addresses
​Ethereum Mainnet
NameAddressAddressManager0x8EfB6B5c4767B09Dc9AA6Af4eAA89F749522BaE2AnchorStateRegistryProxy0x909f6cf47ed12f010A796527f562bFc26C7F4E72DelayedWETHProxy (FDG)0x2453c1216e49704d84ea98a4dacd95738f2fc8ecDelayedWETHProxy (PDG)0x64ae5250958cdeb83f6b61f913b5ac6ebe8efd4dDisputeGameFactoryProxy0x43edB88C4B80fDD2AdFF2412A7BebF9dF42cB40eFaultDisputeGame0x979Cb7E329bA213fB9d6c5F7771eC6a3109BDC93L1CrossDomainMessenger0x866E82a600A1414e583f7F13623F1aC5d58b0AfaL1ERC721Bridge0x608d94945A64503E642E6370Ec598e519a2C1E53L1StandardBridge0x3154Cf16ccdb4C6d922629664174b904d80F2C35MIPS0x6463dEE3828677F6270d83d45408044fc5eDB908OptimismMintableERC20Factory0x05cc379EBD9B30BbA19C6fA282AB29218EC61D84OptimismPortal0x49048044D57e1C92A77f79988d21Fa8fAF74E97ePermissionedDisputeGame0x6f8c1Ea88CB410571739d36EB00811B250574cB2PreimageOracle0x1fb8cdFc6831fc866Ed9C51aF8817Da5c287aDD3ProxyAdmin0x0475cBCAebd9CE8AfA5025828d5b98DFb67E059ESystemConfig0x73a79Fab69143498Ed3712e519A88a918e1f4072SystemDictator0x1fE3fdd1F0193Dd657C0a9AAC37314D6B479E557
Unneeded contract addresses
Certain contracts are mandatory according to the OP Stack SDK, despite not being utilized. For such contracts, you can simply assign the zero address:

StateCommitmentChain
CanonicalTransactionChain
BondManager

​Ethereum Testnet (Sepolia)
NameAddressAddressManager0x709c2B8ef4A9feFc629A8a2C1AF424Dc5BD6ad1BAnchorStateRegistryProxy0x2fF5cC82dBf333Ea30D8ee462178ab1707315355DelayedWETHProxy (FDG)0xd3683e4947A7769603Ab6418eC02f000CE3cF30bDelayedWETHProxy (PDG)0x32cE910d9C6c8F78dc6779c1499aB05F281A054eDisputeGameFactoryProxy0xd6E6dBf4F7EA0ac412fD8b65ED297e64BB7a06E1FaultDisputeGame0x6dDBa09bc4cCB0D6Ca9Fc5350580f74165707499FaultDisputeGame (Kona)0x6dDBa09bc4cCB0D6Ca9Fc5350580f74165707499L1CrossDomainMessenger0xC34855F4De64F1840e5686e64278da901e261f20L1ERC721Bridge0x21eFD066e581FA55Ef105170Cc04d74386a09190L1StandardBridge0xfd0Bf71F60660E2f608ed56e1659C450eB113120L2OutputOracle0x84457ca9D0163FbC4bbfe4Dfbb20ba46e48DF254MIPS0x6463dEE3828677F6270d83d45408044fc5eDB908OptimismMintableERC20Factory0xb1efB9650aD6d0CC1ed3Ac4a0B7f1D5732696D37OptimismPortal0x49f53e41452C74589E85cA1677426Ba426459e85PermissionedDisputeGame0x58bf355C5d4EdFc723eF89d99582ECCfd143266APreimageOracle0x1fb8cdFc6831fc866Ed9C51aF8817Da5c287aDD3ProxyAdmin0x0389E59Aa0a41E4A413Ae70f0008e76CAA34b1F3SystemConfig0xf272670eb55e895584501d564AfEB048bEd26194
​Base Admin Addresses
​Base Mainnet
Admin RoleAddressType of KeyBatch Sender0x5050f69a9786f081509234f1a7f4684b5e5b76c9EOA managed by Coinbase TechnologiesBatch Inbox0xff00000000000000000000000000000000008453EOA (with no known private key)Output Proposer0x642229f238fb9de03374be34b0ed8d9de80752c5EOA managed by Coinbase TechnologiesProxy Admin Owner (L1)0x7bB41C3008B3f03FE483B28b8DB90e19Cf07595cGnosis SafeChallenger0x8Ca1E12404d16373Aef756179B185F27b2994F3aEOA managed by Coinbase TechnologiesSystemConfig owner0x14536667Cd30e52C0b458BaACcB9faDA7046E056Gnosis SafeGuardian0x09f7150D8c019BeF34450d6920f6B3608ceFdAf2Gnosis Safe
​Base Testnet (Sepolia)
Admin RoleAddressType of KeyBatch Sender0x6CDEbe940BC0F26850285cacA097C11c33103E47EOA managed by Coinbase TechnologiesBatch Inbox0xff00000000000000000000000000000000084532EOA (with no known private key)Output Proposer0x037637067c1DbE6d2430616d8f54Cb774Daa5999EOA managed by Coinbase TechnologiesProxy Admin Owner (L1)0x0fe884546476dDd290eC46318785046ef68a0BA9Gnosis SafeChallenger0x8b8c52B04A38f10515C52670fcb23f3C4C44474FEOA managed by Coinbase TechnologiesSystemConfig owner0x5dfEB066334B67355A15dc9b67317fD2a2e1f77fGnosis SafeGuardian0x7a50f00e8D05b95F98fE38d8BeE366a7324dCf7EEOA managed by Coinbase TechnologiesWas this page helpful?YesNoSuggest editsRaise issueBase-Solana BridgePreviousEcosystem ContractsNext⌘I

---

## Related Links

- [Skip to main content](https://docs.base.org/base-chain/network-information/base-contracts#content-area)
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
- [L2 Contract Addresses](https://docs.base.org/base-chain/network-information/base-contracts#l2-contract-addresses)
- [Base Mainnet](https://docs.base.org/base-chain/network-information/base-contracts#base-mainnet)
- [Base Testnet (Sepolia)](https://docs.base.org/base-chain/network-information/base-contracts#base-testnet-sepolia)
- [L1 Contract Addresses](https://docs.base.org/base-chain/network-information/base-contracts#l1-contract-addresses)
- [Ethereum Mainnet](https://docs.base.org/base-chain/network-information/base-contracts#ethereum-mainnet)
- [Ethereum Testnet (Sepolia)](https://docs.base.org/base-chain/network-information/base-contracts#ethereum-testnet-sepolia)
- [Base Admin Addresses](https://docs.base.org/base-chain/network-information/base-contracts#base-admin-addresses)
- [Base Mainnet](https://docs.base.org/base-chain/network-information/base-contracts#base-mainnet-2)
- [Base Testnet (Sepolia)](https://docs.base.org/base-chain/network-information/base-contracts#base-testnet-sepolia-2)
