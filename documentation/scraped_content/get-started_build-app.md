# Build an App - Base Documentation

**Source:** https://docs.base.org/get-started/build-app
**Scraped:** 2026-02-04T10:27:03.063144

---

## Table of Contents

  - ​What You’ll Achieve
  - ​Set Up Your Development Environment
  - ​Deploy Your Contracts
  - ​Interacting with your contract
  - ​Further Improvements

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationQuickstartBuild an AppGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnStatusFaucetBridgeBlogIntroductionBaseQuickstartBuild an AppLaunch a TokenDeploy Smart ContractsBuilder SupportGet FundedBase Services HubBase Mentorship ProgramCountry Leads & AmbassadorsBuild with AIMCP ServerStatic Docs FilesPrompt LibraryOn this pageWhat You’ll AchieveSet Up Your Development EnvironmentDeploy Your ContractsInteracting with your contractFurther ImprovementsWelcome to the Base quickstart guide! In this walkthrough, we’ll create a simple onchain app from start to finish. Whether you’re a seasoned developer or just starting out, this guide has got you covered.
​What You’ll Achieve
By the end of this quickstart, you’ll have built an onchain app by:

Configuring your development environment
Deploying your smart contracts to Base
Interacting with your deployed contracts from the frontend

Our simple app will be an onchain tally app which lets you add to a total tally, stored onchain, by pressing a button.
Why Base?Base is a fast, low-cost, builder-friendly Ethereum L2 built to bring the next billion users onchain. By following this guide, you’ll join a vibrant ecosystem of developers, creators, and innovators who are building a global onchain economy.
​Set Up Your Development Environment
1Bootstrap with OnchainKitOnchainKit is a library of ready-to-use React components and Typescript utilities for building onchain apps. Run the following command in your terminal and follow the prompts to bootstrap your project.TerminalReport incorrect codeCopyAsk AInpm create onchain@latest
The prompts will ask you for a CDP API Key which you can get here.Once you’ve gone through the prompts, you’ll have a new project directory with a basic OnchainKit app. Run the following to see it live.TerminalReport incorrect codeCopyAsk AIcd my-onchainkit-app
npm install
npm run dev
You should see the following screen.Once we’ve deployed our contracts, we’ll add a button that lets us interact with our contracts.2Install and initialize FoundryThe total tally will be stored onchain in a smart contract. We’ll use the Foundry framework to deploy our contract to the Base Sepolia testnet.
Create a new “contracts” folder in the root of your project
TerminalReport incorrect codeCopyAsk AImkdir contracts && cd contracts

Install and initialize Foundry
TerminalReport incorrect codeCopyAsk AIcurl -L https://foundry.paradigm.xyz | bash
foundryup
forge init --no-git
Open the project and find the Counter.sol contract file in the /contracts/src folder. You’ll find the simple logic for our tally app.—no-gitBecause contracts is a folder in our project, we don’t want to initialize a separate git repository for it, so we add the --no-git flag.3Configure Foundry with BaseTo deploy your smart contracts to Base, you need two key components:
A node connection to interact with the Base network
A funded private key to deploy the contract
Let’s set up both of these:
Create a .env file in your contracts directory and add the Base and Base Sepolia RPC URLs
contracts/.envReport incorrect codeCopyAsk AIBASE_RPC_URL="https://mainnet.base.org"
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
-Load your environment variablesTerminalReport incorrect codeCopyAsk AIsource .env
Base SepoliaBase Sepolia is the test network for Base, which we will use for the rest of this guide. You can obtain free Base Sepolia ETH from one of the faucets listed here.4Secure your private keyA private key with testnet funds is required to deploy the contract. You can generate a fresh private key here.
Store your private key in Foundry’s secure keystore
TerminalReport incorrect codeCopyAsk AIcast wallet import deployer --interactive

When prompted enter your private key and a password.
Your private key is stored in ~/.foundry/keystores which is not tracked by git.Never share or commit your private key. Always keep it secure and handle with care.
​Deploy Your Contracts
Now that your environment is set up, let’s deploy your contracts to Base Sepolia. The foundry project provides a deploy script that will deploy the Counter.sol contract.
1Run the deploy script
Use the following command to compile and deploy your contract
TerminalReport incorrect codeCopyAsk AIforge create ./src/Counter.sol:Counter --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer
Note the format of the contract being deployed is <contract-path>:<contract-name>.2Save the contract addressAfter successful deployment, the transaction hash will be printed to the console outputCopy the deployed contract address and add it to your .env fileReport incorrect codeCopyAsk AICOUNTER_CONTRACT_ADDRESS="0x..."
3Load the new environment variableTerminalReport incorrect codeCopyAsk AIsource .env
4Verify Your DeploymentTo ensure your contract was deployed successfully:
Check the transaction on Sepolia Basescan.
Use the cast command to interact with your deployed contract from the command line
Report incorrect codeCopyAsk AIcast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
This will return the initial value of the Counter contract’s number storage variable, which will be 0.
Congratulations! You’ve deployed your smart contract to Base Sepolia!
Now lets connect the frontend to interact with your recently deployed contract.
​Interacting with your contract
To interact with the smart contract logic, we need to submit an onchain transaction. We can do this easily with the Transaction component. This is a simplified version of the Transaction component, designed to streamline the integration process. Instead of manually defining each subcomponent and prop, we can use this shorthand version which renders our suggested implementation of the component and includes the TransactionButton and TransactionToast components.
1Add the Transaction componentLets add the Transaction component to our page.tsx file. Delete the existing content in the main tag and replace it with the snippet below.page.tsxReport incorrect codeCopyAsk AI// @noErrors: 2307 - Cannot find module '@/calls'
import { Transaction } from '@coinbase/onchainkit/transaction';
import { calls } from '@/calls';

<main className="flex flex-grow items-center justify-center">
 <div className="w-full max-w-4xl p-4">
 <div className="mx-auto mb-6 w-1/3">
 <Transaction calls={calls} />
 </div>
 </div>
</main>;
2Defining the contract callsIn the previous code snippet, you’ll see we imported calls from the calls.ts file. This file provides the details needed to interact with our contract and call the increment function. Create a new calls.ts file in the same folder as your page.tsx file and add the following code.calls.tsReport incorrect codeCopyAsk AIconst counterContractAddress = '0x...'; // add your contract address here
const counterContractAbi = [
 {
 type: 'function',
 name: 'increment',
 inputs: [],
 outputs: [],
 stateMutability: 'nonpayable',
 },
] as const;

export const calls = [
 {
 address: counterContractAddress,
 abi: counterContractAbi,
 functionName: 'increment',
 args: [],
 },
];
Contract AddressThe calls.ts file contains the details of the contract interaction, including the contract address, which we saved in the previous step.3Testing the componentNow, when you connect a wallet and click on the Transact button and approve the transaction, it will increment the tally onchain by one.We can verify that the onchain count took place onchain by once again using cast to call the number function on our contract.TerminalReport incorrect codeCopyAsk AIcast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
If the transaction was successful, the tally should have incremented by one!
We now have a working onchain tally app! While the example is simple, it illustrates the end to end process of building on onchain app. We:

Configured a project with frontend and onchain infrastructure
Deployed a smart contract to Base Sepolia
Interacted with the contract from the frontend

​Further Improvements
This is just the beginning. There are many ways we can improve upon this app. For example, we could:

Make the increment transaction gasless by integrating with Paymaster
Improve the wallet connection and sign up flow with the WalletModal component
Add onchain Identity so we know who added the most recent tally
Was this page helpful?YesNoSuggest editsRaise issueBasePreviousLaunch a TokenNext⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
npm create onchain@latest
```

### Code Block 2 (unknown)

```unknown
cd my-onchainkit-app
npm install
npm run dev
```

### Code Block 3 (unknown)

```unknown
mkdir contracts && cd contracts
```

### Code Block 4 (unknown)

```unknown
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge init --no-git
```

### Code Block 5 (unknown)

```unknown
BASE_RPC_URL="https://mainnet.base.org"
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
```

### Code Block 6 (unknown)

```unknown
source .env
```

### Code Block 7 (unknown)

```unknown
cast wallet import deployer --interactive
```

### Code Block 8 (unknown)

```unknown
forge create ./src/Counter.sol:Counter --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer
```

### Code Block 9 (unknown)

```unknown
COUNTER_CONTRACT_ADDRESS="0x..."
```

### Code Block 10 (unknown)

```unknown
source .env
```

### Code Block 11 (unknown)

```unknown
cast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

### Code Block 12 (unknown)

```unknown
// @noErrors: 2307 - Cannot find module '@/calls'
import { Transaction } from '@coinbase/onchainkit/transaction';
import { calls } from '@/calls';

<main className="flex flex-grow items-center justify-center">
  <div className="w-full max-w-4xl p-4">
    <div className="mx-auto mb-6 w-1/3">
      <Transaction calls={calls} />
    </div>
  </div>
</main>;
```

### Code Block 13 (unknown)

```unknown
const counterContractAddress = '0x...'; // add your contract address here
const counterContractAbi = [
  {
    type: 'function',
    name: 'increment',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

export const calls = [
  {
    address: counterContractAddress,
    abi: counterContractAbi,
    functionName: 'increment',
    args: [],
  },
];
```

### Code Block 14 (unknown)

```unknown
cast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

---

## Related Links

- [Skip to main content](https://docs.base.org/get-started/build-app#content-area)
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
- [Faucet](https://docs.base.org/base-chain/tools/network-faucets)
- [Bridge](https://docs.base.org/base-chain/network-information/bridges-mainnet)
- [Build an App](https://docs.base.org/get-started/build-app)
- [Launch a Token](https://docs.base.org/get-started/launch-token)
- [Deploy Smart Contracts](https://docs.base.org/get-started/deploy-smart-contracts)
- [Get Funded](https://docs.base.org/get-started/get-funded)
- [Base Services Hub](https://docs.base.org/get-started/base-services-hub)
- [Base Mentorship Program](https://docs.base.org/get-started/base-mentorship-program)
- [Country Leads & Ambassadors](https://docs.base.org/get-started/country-leads-and-ambassadors)
- [MCP Server](https://docs.base.org/get-started/docs-mcp)
- [Static Docs Files](https://docs.base.org/get-started/docs-llms)
- [Prompt Library](https://docs.base.org/get-started/prompt-library)
- [What You’ll Achieve](https://docs.base.org/get-started/build-app#what-you%E2%80%99ll-achieve)
- [Set Up Your Development Environment](https://docs.base.org/get-started/build-app#set-up-your-development-environment)
- [Deploy Your Contracts](https://docs.base.org/get-started/build-app#deploy-your-contracts)
- [Interacting with your contract](https://docs.base.org/get-started/build-app#interacting-with-your-contract)
- [Further Improvements](https://docs.base.org/get-started/build-app#further-improvements)
- [​](https://docs.base.org/get-started/build-app#what-you’ll-achieve)
- [Paymaster](https://docs.base.org/onchainkit/transaction/transaction#sponsor-with-paymaster-capabilities)
- [WalletModal](https://docs.base.org/onchainkit/wallet/wallet-modal)
- [Identity](https://docs.base.org/onchainkit/identity/identity)
