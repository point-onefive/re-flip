// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {CoinFlip} from "../src/CoinFlip.sol";

contract DeployCoinFlip is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        CoinFlip coinFlip = new CoinFlip();
        
        console.log("CoinFlip deployed to:", address(coinFlip));
        console.log("Owner:", coinFlip.owner());

        vm.stopBroadcast();
    }
}
