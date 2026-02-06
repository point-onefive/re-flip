// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {NFTBattleV2} from "../src/NFTBattleV2.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

contract NFTBattleV2Test is Test {
    NFTBattleV2 public battle;
    VRFCoordinatorV2_5Mock public vrfCoordinator;
    
    address public owner = address(this);
    address public player1 = address(0x1111);
    address public player2 = address(0x2222);
    address public player3 = address(0x3333);
    address public fakeCollection = address(0xC01);
    
    uint256 public subscriptionId;
    
    // Test constants
    uint256 constant WAGER_SMALL = 0.01 ether;  // Below VRF threshold
    uint256 constant WAGER_LARGE = 0.05 ether;  // Above VRF threshold
    
    // Allow contract to receive ETH (for withdrawFees test)
    receive() external payable {}
    
    function setUp() public {
        // Deploy VRF Coordinator Mock
        vrfCoordinator = new VRFCoordinatorV2_5Mock(
            0.1 ether,   // baseFee
            1e9,         // gasPriceLink
            1e18         // weiPerUnitLink
        );
        
        // Create subscription and fund it
        subscriptionId = vrfCoordinator.createSubscription();
        vrfCoordinator.fundSubscription(subscriptionId, 100 ether);
        
        // Deploy battle contract
        battle = new NFTBattleV2(address(vrfCoordinator), subscriptionId);
        
        // Add battle contract as consumer
        vrfCoordinator.addConsumer(subscriptionId, address(battle));
        
        // Fund test accounts
        vm.deal(player1, 10 ether);
        vm.deal(player2, 10 ether);
        vm.deal(player3, 10 ether);
        
        // Create a test deck
        _createTestDeck();
    }
    
    function _createTestDeck() internal {
        // Create deck
        battle.createDeck(fakeCollection, "Test Collection");
        
        // Add cards using arrays (tokenId, power 100-999)
        uint256[] memory tokenIds = new uint256[](5);
        uint256[] memory powers = new uint256[](5);
        tokenIds[0] = 1; powers[0] = 100;
        tokenIds[1] = 2; powers[1] = 300;
        tokenIds[2] = 3; powers[2] = 500;
        tokenIds[3] = 4; powers[3] = 700;
        tokenIds[4] = 5; powers[4] = 999;
        
        battle.addDeckCards(1, tokenIds, powers);
        battle.setDeckActive(1, true);
    }
    
    // ============ Deck Management Tests ============
    
    function test_CreateDeck() public {
        uint256 deckId = battle.createDeck(address(0xABC), "New Deck");
        // deckId is 2 because setUp already created deck 1
        assertEq(deckId, 2);
        
        (NFTBattleV2.Deck memory deck, uint256 cardCount) = battle.getDeck(deckId);
        assertEq(deck.collection, address(0xABC));
        assertEq(deck.name, "New Deck");
        // version starts at 1, active is true by default
        assertEq(deck.version, 1);
        assertTrue(deck.active);
        assertEq(cardCount, 0);
    }
    
    function test_AddDeckCards() public {
        uint256[] memory tokenIds = new uint256[](2);
        uint256[] memory powers = new uint256[](2);
        tokenIds[0] = 10; powers[0] = 150;
        tokenIds[1] = 11; powers[1] = 850;
        
        battle.addDeckCards(1, tokenIds, powers);
        
        (NFTBattleV2.Deck memory deck, uint256 cardCount) = battle.getDeck(1);
        assertEq(cardCount, 7);  // 5 + 2
        // Note: version updates on clearDeck, not addDeckCards
    }
    
    function test_RevertAddCardsInvalidPower() public {
        uint256[] memory tokenIds = new uint256[](1);
        uint256[] memory powers = new uint256[](1);
        tokenIds[0] = 100; powers[0] = 50; // Below 100
        
        vm.expectRevert("Power must be 100-999");
        battle.addDeckCards(1, tokenIds, powers);
    }
    
    function test_RevertAddCardsPowerTooHigh() public {
        uint256[] memory tokenIds = new uint256[](1);
        uint256[] memory powers = new uint256[](1);
        tokenIds[0] = 100; powers[0] = 1000; // Above 999
        
        vm.expectRevert("Power must be 100-999");
        battle.addDeckCards(1, tokenIds, powers);
    }
    
    // ============ Game Creation Tests ============
    
    function test_CreateGame() public {
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        assertEq(gameId, 1);
        assertEq(battle.gameCounter(), 1);
        
        NFTBattleV2.Game memory game = battle.getGame(gameId);
        assertEq(game.player1, player1);
        assertEq(game.player2, address(0));
        assertEq(uint(game.status), uint(NFTBattleV2.GameStatus.Open));
    }
    
    function test_RevertCreateGameInactiveDeck() public {
        battle.setDeckActive(1, false);
        
        vm.prank(player1);
        vm.expectRevert("Deck not active");
        battle.createGame{value: WAGER_SMALL}(1);
    }
    
    function test_RevertCreateGameNoWager() public {
        vm.prank(player1);
        vm.expectRevert("Wager required");
        battle.createGame(1);
    }
    
    // ============ Game Join Tests (Without VRF) ============
    
    function test_JoinGameSmallWager() public {
        // Create game
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        // Join game (below VRF threshold - instant resolution)
        vm.prank(player2);
        battle.joinGame{value: WAGER_SMALL}(gameId);
        
        NFTBattleV2.Game memory game = battle.getGame(gameId);
        
        // Game should be complete immediately
        assertEq(uint(game.status), uint(NFTBattleV2.GameStatus.Complete));
        assertFalse(game.usedVRF);
        assertTrue(game.player1TokenId > 0);
        assertTrue(game.player2TokenId > 0);
        assertTrue(game.player1Power >= 100 && game.player1Power <= 999);
        assertTrue(game.player2Power >= 100 && game.player2Power <= 999);
        assertTrue(game.winner == player1 || game.winner == player2);
    }
    
    function test_JoinGameLargeWagerVRF() public {
        // Create game with large wager
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_LARGE}(1);
        
        // Join game (above VRF threshold - needs VRF)
        vm.prank(player2);
        battle.joinGame{value: WAGER_LARGE}(gameId);
        
        NFTBattleV2.Game memory game = battle.getGame(gameId);
        
        // Game should be waiting for VRF
        assertEq(uint(game.status), uint(NFTBattleV2.GameStatus.WaitingVRF));
        assertTrue(game.usedVRF);
        assertTrue(game.vrfRequestId > 0);
        
        // Simulate VRF callback
        vrfCoordinator.fulfillRandomWords(game.vrfRequestId, address(battle));
        
        // Check game is now complete
        game = battle.getGame(gameId);
        assertEq(uint(game.status), uint(NFTBattleV2.GameStatus.Complete));
        assertTrue(game.player1TokenId > 0);
        assertTrue(game.player2TokenId > 0);
        assertTrue(game.winner == player1 || game.winner == player2);
    }
    
    function test_RevertJoinOwnGame() public {
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        vm.prank(player1);
        vm.expectRevert("Cannot join own game");
        battle.joinGame{value: WAGER_SMALL}(gameId);
    }
    
    function test_RevertJoinWrongWager() public {
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        vm.prank(player2);
        vm.expectRevert("Wrong wager amount");
        battle.joinGame{value: WAGER_LARGE}(gameId);
    }
    
    // ============ Cancel Game Tests ============
    
    function test_CancelGame() public {
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        uint256 balanceBefore = player1.balance;
        
        vm.prank(player1);
        battle.cancelGame(gameId);
        
        uint256 balanceAfter = player1.balance;
        assertEq(balanceAfter - balanceBefore, WAGER_SMALL);
        
        NFTBattleV2.Game memory game = battle.getGame(gameId);
        assertEq(uint(game.status), uint(NFTBattleV2.GameStatus.Cancelled));
    }
    
    function test_RevertCancelNotCreator() public {
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        vm.prank(player2);
        vm.expectRevert("Not game creator");
        battle.cancelGame(gameId);
    }
    
    // ============ Leaderboard Tests ============
    
    function test_LeaderboardPoints() public {
        // Create and complete game
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        vm.prank(player2);
        battle.joinGame{value: WAGER_SMALL}(gameId);
        
        NFTBattleV2.Game memory game = battle.getGame(gameId);
        address winner = game.winner;
        address loser = winner == player1 ? player2 : player1;
        
        // Check player stats
        (uint256 winnerWins, uint256 winnerGames) = battle.getPlayerEpochStats(winner);
        (uint256 loserWins, uint256 loserGames) = battle.getPlayerEpochStats(loser);
        
        assertEq(winnerWins, 1);
        assertEq(loserWins, 0);
        assertEq(winnerGames, 1);
        assertEq(loserGames, 1);
        
        // Check all-time stats
        (uint256 allTimeWinnerWins, uint256 allTimeWinnerGames) = battle.getPlayerAllTimeStats(winner);
        assertEq(allTimeWinnerWins, 1);
        assertEq(allTimeWinnerGames, 1);
    }
    
    function test_EpochReset() public {
        // Play a game
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        vm.prank(player2);
        battle.joinGame{value: WAGER_SMALL}(gameId);
        
        // Verify epoch 1 stats exist
        (uint256 p1Wins, uint256 p1Games) = battle.getPlayerEpochStats(player1);
        assertTrue(p1Games > 0);
        
        // Fast forward past epoch end
        vm.warp(block.timestamp + 8 days);
        
        // Create and COMPLETE another game to trigger epoch reset
        // (epoch check happens in _executeBattle, not createGame)
        vm.prank(player1);
        gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        vm.prank(player3);  // Use player3 to join
        battle.joinGame{value: WAGER_SMALL}(gameId);
        
        // Epoch should now be 2
        assertEq(battle.currentEpoch(), 2);
        
        // Player1's old epoch (1) stats should still exist
        // but current epoch (2) stats should only have the new game
        (uint256 newWins, uint256 newGames) = battle.getPlayerEpochStats(player1);
        assertEq(newGames, 1);  // 1 game in new epoch
    }
    
    function test_GetLeaderboard() public {
        // Play multiple games to create leaderboard entries
        for (uint i = 0; i < 3; i++) {
            vm.prank(player1);
            uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
            
            vm.prank(player2);
            battle.joinGame{value: WAGER_SMALL}(gameId);
        }
        
        (
            address[] memory players,
            uint256[] memory wins,
            uint256[] memory gamesPlayed
        ) = battle.getLeaderboard();
        
        // Should have 2 players
        assertEq(players.length, 2);
        assertTrue(gamesPlayed[0] > 0);
        assertTrue(gamesPlayed[1] > 0);
    }
    
    // ============ Fee Tests ============
    
    function test_FeeCalculation() public {
        uint256 totalPot = WAGER_SMALL * 2;
        uint256 expectedFee = (totalPot * 250) / 10000;  // 2.5%
        
        uint256 feesBefore = battle.accumulatedFees();
        
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        vm.prank(player2);
        battle.joinGame{value: WAGER_SMALL}(gameId);
        
        uint256 feesAfter = battle.accumulatedFees();
        assertEq(feesAfter - feesBefore, expectedFee);
    }
    
    function test_WithdrawFees() public {
        // Play a game to accumulate fees
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        vm.prank(player2);
        battle.joinGame{value: WAGER_SMALL}(gameId);
        
        uint256 fees = battle.accumulatedFees();
        assertTrue(fees > 0);
        
        uint256 ownerBalanceBefore = owner.balance;
        battle.withdrawFees();
        uint256 ownerBalanceAfter = owner.balance;
        
        assertEq(ownerBalanceAfter - ownerBalanceBefore, fees);
        assertEq(battle.accumulatedFees(), 0);
    }
    
    // ============ Rematch Tests ============
    
    function test_RematchFlow() public {
        // Play initial game
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        vm.prank(player2);
        battle.joinGame{value: WAGER_SMALL}(gameId);
        
        // Both request rematch
        vm.prank(player1);
        battle.requestRematch{value: WAGER_SMALL}(gameId);
        
        vm.prank(player2);
        battle.requestRematch{value: WAGER_SMALL}(gameId);
        
        // New game should be created
        assertEq(battle.gameCounter(), 2);
        
        NFTBattleV2.Game memory newGame = battle.getGame(2);
        
        // Players should be swapped
        assertEq(newGame.player1, player2);
        assertEq(newGame.player2, player1);
        assertEq(uint(newGame.status), uint(NFTBattleV2.GameStatus.Complete));
    }
    
    function test_CancelRematch() public {
        // Play initial game
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        vm.prank(player2);
        battle.joinGame{value: WAGER_SMALL}(gameId);
        
        // Player1 requests rematch
        vm.prank(player1);
        battle.requestRematch{value: WAGER_SMALL}(gameId);
        
        // Player1 cancels rematch
        uint256 balanceBefore = player1.balance;
        vm.prank(player1);
        battle.cancelRematchRequest(gameId);
        uint256 balanceAfter = player1.balance;
        
        assertEq(balanceAfter - balanceBefore, WAGER_SMALL);
    }
    
    // ============ Admin Tests ============
    
    function test_SetFee() public {
        battle.setFeeBasisPoints(500);  // 5%
        assertEq(battle.feeBasisPoints(), 500);
    }
    
    function test_RevertSetFeeTooHigh() public {
        vm.expectRevert("Fee too high");
        battle.setFeeBasisPoints(1001);  // > 10%
    }
    
    function test_SetVRFThreshold() public {
        battle.setVRFThreshold(0.1 ether);
        assertEq(battle.vrfThreshold(), 0.1 ether);
    }
    
    function test_SetBonusMultiplier() public {
        battle.setBonusMultiplier(2);  // Double points
        assertEq(battle.bonusMultiplier(), 2);
    }
    
    // ============ View Function Tests ============
    
    function test_GetOpenGames() public {
        // Create multiple games
        vm.prank(player1);
        battle.createGame{value: WAGER_SMALL}(1);
        
        vm.prank(player2);
        battle.createGame{value: WAGER_SMALL}(1);
        
        NFTBattleV2.Game[] memory openGames = battle.getOpenGames();
        assertEq(openGames.length, 2);
    }
    
    function test_GetPlayerGames() public {
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(1);
        
        vm.prank(player2);
        battle.joinGame{value: WAGER_SMALL}(gameId);
        
        NFTBattleV2.Game[] memory player1Games = battle.getPlayerGames(player1);
        NFTBattleV2.Game[] memory player2Games = battle.getPlayerGames(player2);
        
        assertEq(player1Games.length, 1);
        assertEq(player2Games.length, 1);
        assertEq(player1Games[0].id, gameId);
        assertEq(player2Games[0].id, gameId);
    }
    
    function test_GetDeckCard() public {
        (uint256 tokenId, uint256 power) = battle.getDeckCard(1, 0);
        assertEq(tokenId, 1);
        assertEq(power, 100);
        
        (tokenId, power) = battle.getDeckCard(1, 4);
        assertEq(tokenId, 5);
        assertEq(power, 999);
    }
    
    // ============ Edge Cases ============
    
    function test_TieGoesToPlayer1() public {
        // Create deck with all same power cards
        battle.createDeck(address(0xDDD), "Tie Test");
        
        uint256[] memory tokenIds = new uint256[](3);
        uint256[] memory powers = new uint256[](3);
        tokenIds[0] = 1; powers[0] = 500;
        tokenIds[1] = 2; powers[1] = 500;
        tokenIds[2] = 3; powers[2] = 500;
        
        battle.addDeckCards(2, tokenIds, powers);
        battle.setDeckActive(2, true);
        
        // Create game with tie deck
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_SMALL}(2);
        
        vm.prank(player2);
        battle.joinGame{value: WAGER_SMALL}(gameId);
        
        NFTBattleV2.Game memory game = battle.getGame(gameId);
        
        // Both should have same power (all cards are 500)
        assertEq(game.player1Power, game.player2Power);
        // Tie goes to player1
        assertEq(game.winner, player1);
    }
    
    // ============ VRF Edge Cases ============
    
    function test_VRFCallbackOnlyFromCoordinator() public {
        vm.prank(player1);
        uint256 gameId = battle.createGame{value: WAGER_LARGE}(1);
        
        vm.prank(player2);
        battle.joinGame{value: WAGER_LARGE}(gameId);
        
        NFTBattleV2.Game memory game = battle.getGame(gameId);
        assertEq(uint(game.status), uint(NFTBattleV2.GameStatus.WaitingVRF));
        
        // Try to call rawFulfillRandomWords from non-coordinator
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 12345;
        
        vm.prank(player1);
        vm.expectRevert();
        // The VRFConsumerBaseV2Plus checks msg.sender == vrfCoordinator
        battle.rawFulfillRandomWords(game.vrfRequestId, randomWords);
    }
}
