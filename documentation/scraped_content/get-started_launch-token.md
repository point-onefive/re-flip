# Launch a Token - Base Documentation

**Source:** https://docs.base.org/get-started/launch-token
**Scraped:** 2026-02-04T10:27:23.766699

---

## Table of Contents

  - Platform Launch
  - Custom Development
  - Choose Your Approach
  - Best Practices
  - ​Choosing Your Launch Approach
    - ​Platform-Based Launch (Recommended for Most Users)
    - ​Custom Development (For Developers)
  - ​Token Launch Platforms on Base
    - ​Zora
    - ​Clanker
    - ​Flaunch
    - ​Mint Club
  - ​Technical Implementation with Foundry
    - ​Prerequisites
    - ​Project Setup
    - ​Smart Contract Development
    - ​Deployment Script
    - ​Environment Configuration
    - ​Testing
    - ​Deployment and Verification
  - ​Post-Launch Considerations
    - ​Token Distribution and Economics
    - ​Community and Social Presence
    - ​Liquidity and Trading
    - ​Continued Development
  - ​Resources
  - Base Quickstart Guide
  - Base Network Details
  - Foundry Documentation
  - OpenZeppelin Contracts
  - BaseScan Explorer
  - Base Faucet
    - ​Community
  - Base Discord
  - Base Twitter
  - Base GitHub

---

## Content

Base Documentation home pageSearch...⌘KAsk AISearch...NavigationQuickstartLaunch a TokenGet StartedBase ChainBase AccountBase AppMini AppsOnchainKitCookbookShowcaseLearnStatusFaucetBridgeBlogIntroductionBaseQuickstartBuild an AppLaunch a TokenDeploy Smart ContractsBuilder SupportGet FundedBase Services HubBase Mentorship ProgramCountry Leads & AmbassadorsBuild with AIMCP ServerStatic Docs FilesPrompt LibraryOn this pageChoosing Your Launch ApproachPlatform-Based Launch (Recommended for Most Users)Custom Development (For Developers)Token Launch Platforms on BaseZoraClankerFlaunchMint ClubTechnical Implementation with FoundryPrerequisitesProject SetupSmart Contract DevelopmentDeployment ScriptEnvironment ConfigurationTestingDeployment and VerificationPost-Launch ConsiderationsToken Distribution and EconomicsCommunity and Social PresenceLiquidity and TradingContinued DevelopmentResourcesCommunityLaunching a token on Base can be accomplished through multiple approaches, from no-code platforms to custom smart contract development. This guide helps you choose the right method and provides implementation details for both approaches.
Platform LaunchUse existing platforms like Zora, Clanker, or Flaunch for quick deploymentCustom DevelopmentBuild custom ERC-20 tokens with Foundry for maximum controlChoose Your ApproachDecision framework to help you pick the right methodBest PracticesSecurity, community building, and post-launch guidance
For most users: Use existing token launch platforms like Zora, Clanker, or Flaunch. These tools handle the technical complexity while providing unique features for different use cases.For developers: Build custom ERC-20 tokens using Foundry and OpenZeppelin’s battle-tested contracts for maximum control and customization.
​Choosing Your Launch Approach
​Platform-Based Launch (Recommended for Most Users)
Choose a platform when you want:

Quick deployment without coding
Built-in community features
Automated liquidity management
Social integration capabilities

​Custom Development (For Developers)
Build your own smart contract when you need:

Custom tokenomics or functionality
Full control over contract behavior
Integration with existing systems
Advanced security requirements

​Token Launch Platforms on Base
​Zora
Best for: Content creators and social tokens
Zora transforms every post into a tradeable ERC-20 token with automatic Uniswap integration. Each post becomes a “coin” with 1 billion supply, creators receive 10 million tokens, and earn 1% of all trading fees.
Key Features:

Social-first token creation
Automatic liquidity pools
Revenue sharing for creators
Built-in trading interface

Get started with Zora →
​Clanker
Best for: Quick memecoin launches via social media
Clanker is an AI-driven token deployment tool that operates through Farcaster. Users can create ERC-20 tokens on Base by simply tagging @clanker with their token concept.
Key Features:

AI-powered automation
Social media integration via Farcaster
Instant deployment
Community-driven discovery

Get started with Clanker → or visit clanker.world
​Flaunch
Best for: Advanced memecoin projects with sophisticated tokenomics
Flaunch leverages Uniswap V4 to enable programmable revenue splits, automated buybacks, and Progressive Bid Walls for price support. Creators can customize fee distributions and treasury management.
Key Features:

Programmable revenue sharing
Automated buyback mechanisms
Progressive Bid Wall technology
Treasury management tools

Get started with Flaunch →
​Mint Club
Best for: Token families and community-driven assets
Mint Club enables anyone to launch new tokens or NFTs backed by existing ERC-20 tokens. Each trade locks the parent token in a bonding curve pool, creating onchain, auto-managed liquidity that strengthens the parent token while supporting new community assets.
Key Features:

Launch tokens or NFTs from any ERC-20 token
Automated liquidity with customizable bonding curves
Integrated trading interface with cross-chain swap
Built-in airdrop and lock-up tools
Simple trading for tokens and NFTs
Creator revenue sharing

Get started with Mint Club →
​Technical Implementation with Foundry
For developers who want full control over their token implementation, here’s how to create and deploy a custom ERC-20 token on Base using Foundry.
Before launching a custom developed token to production, always conduct security reviews by expert smart contract developers.
​Prerequisites
1Install FoundryInstall Foundry on your system:TerminalReport incorrect codeCopyAsk AIcurl -L https://foundry.paradigm.xyz | bash
foundryup
For detailed installation instructions, see the Foundry documentation.2Get Test ETHObtain Base Sepolia ETH for testing from the Base Faucet3Set Up Development EnvironmentConfigure your wallet and development tools for Base testnet deployment
​Project Setup
Initialize a new Foundry project and clean up template files:
TerminalReport incorrect codeCopyAsk AI# Create new project
forge init my-token-project
cd my-token-project

# Remove template files we don't need
rm src/Counter.sol script/Counter.s.sol test/Counter.t.sol

Install OpenZeppelin contracts for secure, audited ERC-20 implementation:
TerminalReport incorrect codeCopyAsk AI# Install OpenZeppelin contracts library
forge install OpenZeppelin/openzeppelin-contracts

​Smart Contract Development
Create your token contract using OpenZeppelin’s ERC-20 implementation:
src/MyToken.solReport incorrect codeCopyAsk AI// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev ERC-20 token with minting capabilities and supply cap
 */
contract MyToken is ERC20, Ownable {
 // Maximum number of tokens that can ever exist
 uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens

 constructor(
 string memory name,
 string memory symbol,
 uint256 initialSupply,
 address initialOwner
 ) ERC20(name, symbol) Ownable(initialOwner) {
 require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");
 // Mint initial supply to the contract deployer
 _mint(initialOwner, initialSupply);
 }

 /**
 * @dev Mint new tokens (only contract owner can call this)
 * @param to Address to mint tokens to
 * @param amount Amount of tokens to mint
 */
 function mint(address to, uint256 amount) public onlyOwner {
 require(totalSupply() + amount <= MAX_SUPPLY, "Minting would exceed max supply");
 _mint(to, amount);
 }

 /**
 * @dev Burn tokens from caller's balance
 * @param amount Amount of tokens to burn
 */
 function burn(uint256 amount) public {
 _burn(msg.sender, amount);
 }
}

​Deployment Script
Create a deployment script following Foundry best practices:
script/DeployToken.s.solReport incorrect codeCopyAsk AI// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {MyToken} from "../src/MyToken.sol";

contract DeployToken is Script {
 function run() external {
 // Load deployer's private key from environment variables
 uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
 address deployerAddress = vm.addr(deployerPrivateKey);

 // Token configuration parameters
 string memory name = "My Token";
 string memory symbol = "MTK";
 uint256 initialSupply = 100_000_000 * 10**18; // 100 million tokens

 // Start broadcasting transactions
 vm.startBroadcast(deployerPrivateKey);

 // Deploy the token contract
 MyToken token = new MyToken(
 name,
 symbol,
 initialSupply,
 deployerAddress
 );

 // Stop broadcasting transactions
 vm.stopBroadcast();

 // Log deployment information
 console.log("Token deployed to:", address(token));
 console.log("Token name:", token.name());
 console.log("Token symbol:", token.symbol());
 console.log("Initial supply:", token.totalSupply());
 console.log("Deployer balance:", token.balanceOf(deployerAddress));
 }
}

​Environment Configuration
Create a .env file with your configuration:
.envReport incorrect codeCopyAsk AIPRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key_here

Update foundry.toml for Base network configuration:
foundry.tomlReport incorrect codeCopyAsk AI[profile.default]
src = "src"
out = "out"
libs = ["lib"]
remappings = ["@openzeppelin/=lib/openzeppelin-contracts/"]

[rpc_endpoints]
base_sepolia = "${BASE_SEPOLIA_RPC_URL}"
base_mainnet = "${BASE_MAINNET_RPC_URL}"

[etherscan]
base_sepolia = { key = "${BASESCAN_API_KEY}", url = "https://api-sepolia.basescan.org/api" }
base = { key = "${BASESCAN_API_KEY}", url = "https://api.basescan.org/api" }

​Testing
Create comprehensive tests for your token:
test/MyToken.t.solReport incorrect codeCopyAsk AI// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {MyToken} from "../src/MyToken.sol";

contract MyTokenTest is Test {
 MyToken public token;
 address public owner = address(0x1);
 address public user = address(0x2);

 uint256 constant INITIAL_SUPPLY = 100_000_000 * 10**18;

 function setUp() public {
 // Deploy token contract before each test
 vm.prank(owner);
 token = new MyToken("Test Token", "TEST", INITIAL_SUPPLY, owner);
 }

 function testInitialState() public {
 // Verify token was deployed with correct parameters
 assertEq(token.name(), "Test Token");
 assertEq(token.symbol(), "TEST");
 assertEq(token.totalSupply(), INITIAL_SUPPLY);
 assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
 }

 function testMinting() public {
 uint256 mintAmount = 1000 * 10**18;

 // Only owner should be able to mint
 vm.prank(owner);
 token.mint(user, mintAmount);

 assertEq(token.balanceOf(user), mintAmount);
 assertEq(token.totalSupply(), INITIAL_SUPPLY + mintAmount);
 }

 function testBurning() public {
 uint256 burnAmount = 1000 * 10**18;

 // Owner burns their own tokens
 vm.prank(owner);
 token.burn(burnAmount);

 assertEq(token.balanceOf(owner), INITIAL_SUPPLY - burnAmount);
 assertEq(token.totalSupply(), INITIAL_SUPPLY - burnAmount);
 }

 function testFailMintExceedsMaxSupply() public {
 // This test should fail when trying to mint more than max supply
 uint256 excessiveAmount = token.MAX_SUPPLY() + 1;

 vm.prank(owner);
 token.mint(user, excessiveAmount);
 }

 function testFailUnauthorizedMinting() public {
 // This test should fail when non-owner tries to mint
 vm.prank(user);
 token.mint(user, 1000 * 10**18);
 }
}

Run your tests:
TerminalReport incorrect codeCopyAsk AI# Run all tests with verbose output
forge test -vv

​Deployment and Verification
Deploy to Base Sepolia testnet:
TerminalReport incorrect codeCopyAsk AI# Load environment variables
source .env

# Deploy to Base Sepolia with automatic verification
forge script script/DeployToken.s.sol:DeployToken \
 --rpc-url base_sepolia \
 --broadcast \
 --verify

The --verify flag automatically verifies your contract on BaseScan, making it easier for users to interact with your token.
To deploy to Base Mainnet, simply change base_sepolia to base_mainnet in your deployment command. Ensure you have sufficient ETH on Base Mainnet for deployment and gas fees.
​Post-Launch Considerations
Once your token is deployed, here are the key next steps to consider:
​Token Distribution and Economics
Carefully consider your token’s supply and distribution settings. Think through how tokens will be distributed to your community, team, and ecosystem participants. Consider factors like vesting schedules, allocation percentages, and long-term incentive alignment.
​Community and Social Presence
Establish a community and social presence around your token and project. This includes creating documentation, setting up social media accounts, engaging with the Base ecosystem, and building relationships with other projects and developers.
​Liquidity and Trading
Add liquidity to decentralized exchanges like Uniswap to enable trading. Note that token launchers will typically handle this for you automatically, but for custom deployments, you’ll need to create trading pairs and provide initial liquidity.
​Continued Development
For comprehensive guidance on growing your project on Base, including marketing strategies, ecosystem integration, and growth tactics, visit the Base Launch Playbook.
Remember to always prioritize security, transparency, and community value when developing and launching tokens. Consider conducting security audits and following best practices for token distribution.
​Resources
Base Quickstart GuideComplete guide to getting started on BaseBase Network DetailsTechnical specifications and network informationFoundry DocumentationComprehensive guide to using FoundryOpenZeppelin ContractsSecurity-focused smart contract libraryBaseScan ExplorerExplore transactions and contracts on BaseBase FaucetGet testnet ETH for development
​Community
Base DiscordJoin the Base communityBase TwitterFollow Base updatesBase GitHubContribute to Base development

Whether you choose a platform-based approach for speed and convenience, or custom development for maximum control, Base provides a robust foundation for token launches. Start with the approach that best fits your technical expertise and project requirements, and leverage Base’s growing ecosystem to build successful token projects.Was this page helpful?YesNoSuggest editsRaise issueBuild an AppPreviousDeploy Smart ContractsNext⌘I

---

## Code Examples

### Code Block 1 (unknown)

```unknown
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Code Block 2 (unknown)

```unknown
# Create new project
forge init my-token-project
cd my-token-project

# Remove template files we don't need
rm src/Counter.sol script/Counter.s.sol test/Counter.t.sol
```

### Code Block 3 (unknown)

```unknown
# Install OpenZeppelin contracts library
forge install OpenZeppelin/openzeppelin-contracts
```

### Code Block 4 (unknown)

```unknown
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev ERC-20 token with minting capabilities and supply cap
 */
contract MyToken is ERC20, Ownable {
    // Maximum number of tokens that can ever exist
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");
        // Mint initial supply to the contract deployer
        _mint(initialOwner, initialSupply);
    }
    
    /**
     * @dev Mint new tokens (only contract owner can call this)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Minting would exceed max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
```

### Code Block 5 (unknown)

```unknown
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {MyToken} from "../src/MyToken.sol";

contract DeployToken is Script {
    function run() external {
        // Load deployer's private key from environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        // Token configuration parameters
        string memory name = "My Token";
        string memory symbol = "MTK";
        uint256 initialSupply = 100_000_000 * 10**18; // 100 million tokens
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the token contract
        MyToken token = new MyToken(
            name,
            symbol,
            initialSupply,
            deployerAddress
        );
        
        // Stop broadcasting transactions
        vm.stopBroadcast();
        
        // Log deployment information
        console.log("Token deployed to:", address(token));
        console.log("Token name:", token.name());
        console.log("Token symbol:", token.symbol());
        console.log("Initial supply:", token.totalSupply());
        console.log("Deployer balance:", token.balanceOf(deployerAddress));
    }
}
```

### Code Block 6 (unknown)

```unknown
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key_here
```

### Code Block 7 (unknown)

```unknown
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
remappings = ["@openzeppelin/=lib/openzeppelin-contracts/"]

[rpc_endpoints]
base_sepolia = "${BASE_SEPOLIA_RPC_URL}"
base_mainnet = "${BASE_MAINNET_RPC_URL}"

[etherscan]
base_sepolia = { key = "${BASESCAN_API_KEY}", url = "https://api-sepolia.basescan.org/api" }
base = { key = "${BASESCAN_API_KEY}", url = "https://api.basescan.org/api" }
```

### Code Block 8 (unknown)

```unknown
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {MyToken} from "../src/MyToken.sol";

contract MyTokenTest is Test {
    MyToken public token;
    address public owner = address(0x1);
    address public user = address(0x2);
    
    uint256 constant INITIAL_SUPPLY = 100_000_000 * 10**18;
    
    function setUp() public {
        // Deploy token contract before each test
        vm.prank(owner);
        token = new MyToken("Test Token", "TEST", INITIAL_SUPPLY, owner);
    }
    
    function testInitialState() public {
        // Verify token was deployed with correct parameters
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
    }
    
    function testMinting() public {
        uint256 mintAmount = 1000 * 10**18;
        
        // Only owner should be able to mint
        vm.prank(owner);
        token.mint(user, mintAmount);
        
        assertEq(token.balanceOf(user), mintAmount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + mintAmount);
    }
    
    function testBurning() public {
        uint256 burnAmount = 1000 * 10**18;
        
        // Owner burns their own tokens
        vm.prank(owner);
        token.burn(burnAmount);
        
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - burnAmount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY - burnAmount);
    }
    
    function testFailMintExceedsMaxSupply() public {
        // This test should fail when trying to mint more than max supply
        uint256 excessiveAmount = token.MAX_SUPPLY() + 1;
        
        vm.prank(owner);
        token.mint(user, excessiveAmount);
    }
    
    function testFailUnauthorizedMinting() public {
        // This test should fail when non-owner tries to mint
        vm.prank(user);
        token.mint(user, 1000 * 10**18);
    }
}
```

### Code Block 9 (unknown)

```unknown
# Run all tests with verbose output
forge test -vv
```

### Code Block 10 (unknown)

```unknown
# Load environment variables
source .env

# Deploy to Base Sepolia with automatic verification
forge script script/DeployToken.s.sol:DeployToken \
    --rpc-url base_sepolia \
    --broadcast \
    --verify
```

---

## Related Links

- [Skip to main content](https://docs.base.org/get-started/launch-token#content-area)
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
- [Choosing Your Launch Approach](https://docs.base.org/get-started/launch-token#choosing-your-launch-approach)
- [Platform-Based Launch (Recommended for Most Users)](https://docs.base.org/get-started/launch-token#platform-based-launch-recommended-for-most-users)
- [Custom Development (For Developers)](https://docs.base.org/get-started/launch-token#custom-development-for-developers)
- [Token Launch Platforms on Base](https://docs.base.org/get-started/launch-token#token-launch-platforms-on-base)
- [Zora](https://docs.base.org/get-started/launch-token#zora)
- [Clanker](https://docs.base.org/get-started/launch-token#clanker)
- [Flaunch](https://docs.base.org/get-started/launch-token#flaunch)
- [Mint Club](https://docs.base.org/get-started/launch-token#mint-club)
- [Technical Implementation with Foundry](https://docs.base.org/get-started/launch-token#technical-implementation-with-foundry)
- [Prerequisites](https://docs.base.org/get-started/launch-token#prerequisites)
- [Project Setup](https://docs.base.org/get-started/launch-token#project-setup)
- [Smart Contract Development](https://docs.base.org/get-started/launch-token#smart-contract-development)
- [Deployment Script](https://docs.base.org/get-started/launch-token#deployment-script)
- [Environment Configuration](https://docs.base.org/get-started/launch-token#environment-configuration)
- [Testing](https://docs.base.org/get-started/launch-token#testing)
- [Deployment and Verification](https://docs.base.org/get-started/launch-token#deployment-and-verification)
- [Post-Launch Considerations](https://docs.base.org/get-started/launch-token#post-launch-considerations)
- [Token Distribution and Economics](https://docs.base.org/get-started/launch-token#token-distribution-and-economics)
- [Community and Social Presence](https://docs.base.org/get-started/launch-token#community-and-social-presence)
- [Liquidity and Trading](https://docs.base.org/get-started/launch-token#liquidity-and-trading)
- [Continued Development](https://docs.base.org/get-started/launch-token#continued-development)
- [Resources](https://docs.base.org/get-started/launch-token#resources)
- [Community](https://docs.base.org/get-started/launch-token#community)
- [Base Faucet](https://docs.base.org/docs/tools/network-faucets)
- [Base Quickstart GuideComplete guide to getting started on Base](https://docs.base.org/quickstart)
- [Base Network DetailsTechnical specifications and network information](https://docs.base.org/network-information)
- [Base DiscordJoin the Base community](https://base.org/discord)
- [Base GitHubContribute to Base development](https://github.com/base-org)
