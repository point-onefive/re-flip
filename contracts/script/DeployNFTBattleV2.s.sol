// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {NFTBattleV2} from "../src/NFTBattleV2.sol";

/**
 * @title DeployNFTBattleV2
 * @notice Deployment script for NFTBattleV2 contract
 * 
 * Prerequisites:
 * 1. Create a Chainlink VRF subscription at https://vrf.chain.link
 * 2. Fund the subscription with LINK tokens
 * 3. After deployment, add the contract as a consumer to your subscription
 * 
 * Usage:
 * forge script script/DeployNFTBattleV2.s.sol:DeployNFTBattleV2 \
 *   --rpc-url base-sepolia \
 *   --broadcast \
 *   --verify \
 *   -vvvv
 */
contract DeployNFTBattleV2 is Script {
    // Base Sepolia VRF Coordinator
    address constant VRF_COORDINATOR = 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE;
    
    function run() external {
        // Get subscription ID from environment variable (0 = VRF disabled for testing)
        uint256 subscriptionId = vm.envOr("VRF_SUBSCRIPTION_ID", uint256(0));
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        NFTBattleV2 battle = new NFTBattleV2(VRF_COORDINATOR, subscriptionId);
        
        console.log("NFTBattleV2 deployed at:", address(battle));
        console.log("VRF Coordinator:", VRF_COORDINATOR);
        console.log("Subscription ID:", subscriptionId);
        console.log("");
        console.log("NEXT STEPS:");
        console.log("1. Add this contract as a consumer to your VRF subscription");
        console.log("2. Create a deck and add cards using addDeckCards()");
        console.log("3. Set the deck active using setDeckActive()");
        
        vm.stopBroadcast();
    }
}

/**
 * @title SetupDeck
 * @notice Script to set up a deck with cards after deployment
 * 
 * Usage:
 * forge script script/DeployNFTBattleV2.s.sol:SetupDeck \
 *   --rpc-url base-sepolia \
 *   --broadcast \
 *   -vvvv
 */
contract SetupDeck is Script {
    function run() external {
        address battleAddress = vm.envAddress("NFTBATTLE_V2_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        NFTBattleV2 battle = NFTBattleV2(payable(battleAddress));
        
        // Example: Create a deck for a collection
        // Replace with actual collection address
        address collectionAddress = 0x7E9269Cb15Cf3e8925c4E0f3c12ffb61D9DCC0CF; // Example
        
        uint256 deckId = battle.createDeck(collectionAddress, "Test Collection");
        console.log("Created deck with ID:", deckId);
        
        // Example: Add some test cards
        // In production, these would come from analyze-collection-v2.ts output
        uint256[] memory tokenIds = new uint256[](5);
        uint256[] memory powers = new uint256[](5);
        
        tokenIds[0] = 1; powers[0] = 500;
        tokenIds[1] = 2; powers[1] = 600;
        tokenIds[2] = 3; powers[2] = 700;
        tokenIds[3] = 4; powers[3] = 800;
        tokenIds[4] = 5; powers[4] = 900;
        
        battle.addDeckCards(deckId, tokenIds, powers);
        console.log("Added 5 cards to deck");
        
        battle.setDeckActive(deckId, true);
        console.log("Deck activated");
        
        vm.stopBroadcast();
    }
}
