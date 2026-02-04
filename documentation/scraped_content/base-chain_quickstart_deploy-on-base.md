# Deploy on Base - Base Documentation

**Source:** https://docs.base.org/base-chain/quickstart/deploy-on-base
**Scraped:** 2026-02-04T10:27:07.304783

---

## Table of Contents

  - ​What You’ll Achieve
  - ​Set Up Your Development Environment
  - ​Configure Foundry with Base
    - ​1. Set up your node connection
    - ​2. Secure your private key
  - ​Deploy Your Contracts
    - ​Verify Your Deployment
  - ​Next Steps

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationQuickstartDeploy on BaseGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnGitHubStatusChain StatsExplorerSupportBlogQuickstartWhy Base?Deploy on BaseConnecting to BaseBase-Mainnet BridgeBase-Solana BridgeNetwork InformationBase ContractsEcosystem ContractsNetwork FeesBlock BuildingTransaction FinalityDifferences: Ethereum & BaseTroubleshooting TransactionsConfiguration ChangelogFlashblocksAppsNode ProvidersFlashblocks FAQNode OperatorsGetting StartedPerformance TuningSnapshotsTroubleshootingBuilder CodesBase Builder CodesBuilder Codes FAQToolsBase ProductsOnchain Registry APINode ProvidersBlock ExplorersNetwork FaucetsOraclesUser OnboardingData IndexersCross-chainAccount AbstractionOnrampsTokens in Coinbase WalletSecuritySecurity Council for BaseAvoid Malicious FlagsReport a VulnerabilityOn this pageWhat You’ll AchieveSet Up Your Development EnvironmentConfigure Foundry with Base1. Set up your node connection2. Secure your private keyDeploy Your ContractsVerify Your DeploymentNext StepsWelcome to the Base deployment quickstart guide! This comprehensive walkthrough will help you set up your environment and deploy smart contracts on Base. Whether you’re a seasoned developer or just starting out, this guide has got you covered.
​What You’ll Achieve
By the end of this quickstart, you’ll be able to:

Set up your development environment to deploy on Base
Deploy your smart contracts to Base
Connect your frontend to your smart contracts

Why Base?Base is a fast, low-cost, builder-friendly Ethereum L2 built to bring the next billion users onchain. By following this guide, you’ll join a vibrant ecosystem of developers, creators, and innovators who are building a global onchain economy.
​Set Up Your Development Environment

Create a new project directory

Report incorrect codeCopyAsk AImkdir my-base-project && cd my-base-project

Install Foundry, a powerful framework for smart contract development

Report incorrect codeCopyAsk AIcurl -L https://foundry.paradigm.xyz | bash
foundryup

This installs Foundry and updates it to the latest version.

Initialize a new Solidity project

Report incorrect codeCopyAsk AIforge init

Your Foundry project is now ready. You’ll find an example contract in the src directory, which you can replace with your own contracts. For the purposes of this guide, we’ll use the Counter contract provided in /src/Counter.sol
Foundry provides a suite of tools for Ethereum application development, including Forge (for testing), Cast (for interacting with the chain), and Anvil (for setting up a local node). You can learn more about Foundry here.
​Configure Foundry with Base
To deploy your smart contracts to Base, you need two key components:

A node connection to interact with the Base network
A funded private key to deploy the contract

Let’s set up both of these:
​1. Set up your node connection

Create a .env file in your project’s root directory
Add the Base network RPC URL to your .env file

Report incorrect codeCopyAsk AIBASE_RPC_URL="https://mainnet.base.org"
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"

Load your environment variables

Report incorrect codeCopyAsk AIsource .env

Base Sepolia is the test network for Base, which we will use for the rest of this guide. You can obtain free Base Sepolia ETH from one of the faucets listed here.
​2. Secure your private key

Store your private key in Foundry’s secure keystore

Report incorrect codeCopyAsk AIcast wallet import deployer --interactive

When prompted enter your private key and a password.

Your private key is stored in ~/.foundry/keystores which is not tracked by git.
Never share or commit your private key. Always keep it secure and handle with care.
​Deploy Your Contracts
Now that your environment is set up, let’s deploy your contracts to Base Sepolia.

(Optional) First, perform a dry run to simulate the deployment and verify everything is configured correctly:

Report incorrect codeCopyAsk AIforge create ./src/Counter.sol:Counter --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer

This performs a simulation without broadcasting the transaction to the network. You’ll see the transaction details and contract ABI, but no actual deployment will occur.

Deploy your contract by adding the --broadcast flag:

Report incorrect codeCopyAsk AIforge create ./src/Counter.sol:Counter --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer --broadcast

The --broadcast flag is required to actually deploy your contract to the network. Without it, Foundry only performs a dry run simulation.
Note the format of the contract being deployed is <contract-path>:<contract-name>.

After successful deployment, you’ll see output including:

Report incorrect codeCopyAsk AIDeployer: 0x...
Deployed to: 0x... <-- YOUR CONTRACT ADDRESS
Transaction hash: 0x...

Copy the deployed contract address and add it to your .env file:

Report incorrect codeCopyAsk AICOUNTER_CONTRACT_ADDRESS="0x..."

Replace 0x... with your actual deployed contract address from the output above.

Load the new environment variable:

Report incorrect codeCopyAsk AIsource .env

You need to run source .env after modifying your .env file to load the new variables in your current terminal session.
​Verify Your Deployment
To ensure your contract was deployed successfully:

Check the transaction on Sepolia Basescan using your transaction hash
Use the cast command to interact with your deployed contract from the command line:

Report incorrect codeCopyAsk AIcast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL

Make sure you’ve added COUNTER_CONTRACT_ADDRESS to your .env file and run source .env before running this command. Otherwise, the environment variable will be undefined and the command will fail.
This will return the initial value of the Counter contract’s number storage variable, which will be 0.
Congratulations! You’ve deployed your smart contracts to Base Sepolia!
​Next Steps

Use Onchainkit to connect your frontend to your contracts! Onchainkit is a library of ready-to-use React components and Typescript utilities.
Learn more about interacting with your contracts in the command line using Foundry from our Foundry tutorial.
Was this page helpful?YesNoSuggest editsRaise issueWhy Base?PreviousConnecting to BaseNext⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
mkdir my-base-project && cd my-base-project
```

### Code Block 2 (unknown)

```unknown
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Code Block 3 (unknown)

```unknown
forge init
```

### Code Block 4 (unknown)

```unknown
BASE_RPC_URL="https://mainnet.base.org"
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
```

### Code Block 5 (unknown)

```unknown
source .env
```

### Code Block 6 (unknown)

```unknown
cast wallet import deployer --interactive
```

### Code Block 7 (unknown)

```unknown
forge create ./src/Counter.sol:Counter --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer
```

### Code Block 8 (unknown)

```unknown
forge create ./src/Counter.sol:Counter --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer --broadcast
```

### Code Block 9 (unknown)

```unknown
Deployer: 0x...
Deployed to: 0x...  <-- YOUR CONTRACT ADDRESS
Transaction hash: 0x...
```

### Code Block 10 (unknown)

```unknown
COUNTER_CONTRACT_ADDRESS="0x..."
```

### Code Block 11 (unknown)

```unknown
source .env
```

### Code Block 12 (unknown)

```unknown
cast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

---

## Related Links

- [Skip to main content](https://docs.base.org/base-chain/quickstart/deploy-on-base#content-area)
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
- [What You’ll Achieve](https://docs.base.org/base-chain/quickstart/deploy-on-base#what-you%E2%80%99ll-achieve)
- [Set Up Your Development Environment](https://docs.base.org/base-chain/quickstart/deploy-on-base#set-up-your-development-environment)
- [Configure Foundry with Base](https://docs.base.org/base-chain/quickstart/deploy-on-base#configure-foundry-with-base)
- [1. Set up your node connection](https://docs.base.org/base-chain/quickstart/deploy-on-base#1-set-up-your-node-connection)
- [2. Secure your private key](https://docs.base.org/base-chain/quickstart/deploy-on-base#2-secure-your-private-key)
- [Deploy Your Contracts](https://docs.base.org/base-chain/quickstart/deploy-on-base#deploy-your-contracts)
- [Verify Your Deployment](https://docs.base.org/base-chain/quickstart/deploy-on-base#verify-your-deployment)
- [Next Steps](https://docs.base.org/base-chain/quickstart/deploy-on-base#next-steps)
- [​](https://docs.base.org/base-chain/quickstart/deploy-on-base#what-you’ll-achieve)
- [Foundry tutorial](https://docs.base.org/learn/foundry/deploy-with-foundry)
