// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {CoinFlip} from "../src/CoinFlip.sol";

contract CoinFlipTest is Test {
    CoinFlip public coinFlip;
    
    address public owner = makeAddr("owner");
    address public player1 = makeAddr("player1");
    address public player2 = makeAddr("player2");
    address public player3 = makeAddr("player3");
    
    uint256 public constant WAGER = 0.01 ether;

    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 wagerAmount);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event CallerSelected(uint256 indexed gameId, address indexed caller);
    event CoinCalled(uint256 indexed gameId, address indexed caller, CoinFlip.CoinSide side);
    event CoinFlipped(uint256 indexed gameId, CoinFlip.CoinSide result, address indexed winner, uint256 payout);
    event GameCancelled(uint256 indexed gameId);
    event RematchRequested(uint256 indexed gameId, address indexed player);
    event RematchStarted(uint256 indexed oldGameId, uint256 indexed newGameId);

    function setUp() public {
        vm.prank(owner);
        coinFlip = new CoinFlip();
        
        // Fund test accounts
        vm.deal(player1, 10 ether);
        vm.deal(player2, 10 ether);
        vm.deal(player3, 10 ether);
    }

    // ============ Create Game Tests ============

    function test_CreateGame() public {
        vm.prank(player1);
        uint256 gameId = coinFlip.createGame{value: WAGER}();

        assertEq(gameId, 1);
        assertEq(coinFlip.gameCounter(), 1);
        
        CoinFlip.Game memory game = coinFlip.getGame(gameId);
        assertEq(game.player1, player1);
        assertEq(game.player2, address(0));
        assertEq(game.wagerAmount, WAGER);
        assertEq(uint(game.status), uint(CoinFlip.GameStatus.Open));
    }

    function test_CreateGame_EmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit GameCreated(1, player1, WAGER);
        
        vm.prank(player1);
        coinFlip.createGame{value: WAGER}();
    }

    function test_CreateGame_RevertZeroWager() public {
        vm.prank(player1);
        vm.expectRevert(CoinFlip.InvalidWagerAmount.selector);
        coinFlip.createGame{value: 0}();
    }

    function test_CreateMultipleGames() public {
        vm.prank(player1);
        uint256 game1 = coinFlip.createGame{value: WAGER}();
        
        vm.prank(player2);
        uint256 game2 = coinFlip.createGame{value: WAGER * 2}();

        assertEq(game1, 1);
        assertEq(game2, 2);
        assertEq(coinFlip.gameCounter(), 2);
    }

    // ============ Join Game Tests ============

    function test_JoinGame() public {
        vm.prank(player1);
        uint256 gameId = coinFlip.createGame{value: WAGER}();

        vm.prank(player2);
        coinFlip.joinGame{value: WAGER}(gameId);

        CoinFlip.Game memory game = coinFlip.getGame(gameId);
        assertEq(game.player2, player2);
        assertEq(uint(game.status), uint(CoinFlip.GameStatus.Active));
        assertTrue(game.currentCaller == player1 || game.currentCaller == player2);
    }

    function test_JoinGame_RevertWrongWager() public {
        vm.prank(player1);
        uint256 gameId = coinFlip.createGame{value: WAGER}();

        vm.prank(player2);
        vm.expectRevert(CoinFlip.WagerMismatch.selector);
        coinFlip.joinGame{value: WAGER / 2}(gameId);
    }

    function test_JoinGame_RevertJoinOwnGame() public {
        vm.prank(player1);
        uint256 gameId = coinFlip.createGame{value: WAGER}();

        vm.prank(player1);
        vm.expectRevert(CoinFlip.CannotJoinOwnGame.selector);
        coinFlip.joinGame{value: WAGER}(gameId);
    }

    function test_JoinGame_RevertGameFull() public {
        vm.prank(player1);
        uint256 gameId = coinFlip.createGame{value: WAGER}();

        vm.prank(player2);
        coinFlip.joinGame{value: WAGER}(gameId);

        vm.prank(player3);
        vm.expectRevert(CoinFlip.GameNotOpen.selector);
        coinFlip.joinGame{value: WAGER}(gameId);
    }

    // ============ Call Coin Tests ============

    function test_CallCoin_Heads() public {
        (uint256 gameId, address caller) = _createAndJoinGame();

        vm.prank(caller);
        coinFlip.callCoin(gameId, CoinFlip.CoinSide.Heads);

        CoinFlip.Game memory game = coinFlip.getGame(gameId);
        assertEq(uint(game.status), uint(CoinFlip.GameStatus.Complete));
        assertTrue(game.winner == player1 || game.winner == player2);
    }

    function test_CallCoin_Tails() public {
        (uint256 gameId, address caller) = _createAndJoinGame();

        vm.prank(caller);
        coinFlip.callCoin(gameId, CoinFlip.CoinSide.Tails);

        CoinFlip.Game memory game = coinFlip.getGame(gameId);
        assertEq(uint(game.status), uint(CoinFlip.GameStatus.Complete));
    }

    function test_CallCoin_RevertNotCaller() public {
        (uint256 gameId, address caller) = _createAndJoinGame();
        address notCaller = (caller == player1) ? player2 : player1;

        vm.prank(notCaller);
        vm.expectRevert(CoinFlip.NotYourTurn.selector);
        coinFlip.callCoin(gameId, CoinFlip.CoinSide.Heads);
    }

    function test_CallCoin_RevertNoneSide() public {
        (uint256 gameId, address caller) = _createAndJoinGame();

        vm.prank(caller);
        vm.expectRevert(CoinFlip.InvalidWagerAmount.selector);
        coinFlip.callCoin(gameId, CoinFlip.CoinSide.None);
    }

    // ============ Game Completion & Payout Tests ============

    function test_WinnerGetsPayout() public {
        (uint256 gameId, address caller) = _createAndJoinGame();

        uint256 player1BalanceBefore = player1.balance;
        uint256 player2BalanceBefore = player2.balance;

        vm.prank(caller);
        coinFlip.callCoin(gameId, CoinFlip.CoinSide.Heads);

        CoinFlip.Game memory game = coinFlip.getGame(gameId);
        
        uint256 totalPot = WAGER * 2;
        uint256 fee = totalPot / 100; // 1%
        uint256 expectedPayout = totalPot - fee;

        if (game.winner == player1) {
            assertEq(player1.balance, player1BalanceBefore + expectedPayout);
        } else {
            assertEq(player2.balance, player2BalanceBefore + expectedPayout);
        }

        assertEq(coinFlip.collectedFees(), fee);
    }

    function test_FeeCollection() public {
        (uint256 gameId, address caller) = _createAndJoinGame();

        vm.prank(caller);
        coinFlip.callCoin(gameId, CoinFlip.CoinSide.Heads);

        uint256 expectedFee = (WAGER * 2) / 100;
        assertEq(coinFlip.collectedFees(), expectedFee);
    }

    // ============ Cancel Game Tests ============

    function test_CancelGame() public {
        vm.prank(player1);
        uint256 gameId = coinFlip.createGame{value: WAGER}();

        uint256 balanceBefore = player1.balance;

        vm.prank(player1);
        coinFlip.cancelGame(gameId);

        CoinFlip.Game memory game = coinFlip.getGame(gameId);
        assertEq(uint(game.status), uint(CoinFlip.GameStatus.Cancelled));
        assertEq(player1.balance, balanceBefore + WAGER);
    }

    function test_CancelGame_RevertNotCreator() public {
        vm.prank(player1);
        uint256 gameId = coinFlip.createGame{value: WAGER}();

        vm.prank(player2);
        vm.expectRevert(CoinFlip.NotAPlayer.selector);
        coinFlip.cancelGame(gameId);
    }

    function test_CancelGame_RevertAfterJoin() public {
        vm.prank(player1);
        uint256 gameId = coinFlip.createGame{value: WAGER}();

        vm.prank(player2);
        coinFlip.joinGame{value: WAGER}(gameId);

        vm.prank(player1);
        vm.expectRevert(CoinFlip.GameNotOpen.selector);
        coinFlip.cancelGame(gameId);
    }

    // ============ Rematch Tests ============

    function test_RequestRematch() public {
        (uint256 gameId, address caller) = _createAndJoinGame();
        
        vm.prank(caller);
        coinFlip.callCoin(gameId, CoinFlip.CoinSide.Heads);

        vm.prank(player1);
        coinFlip.requestRematch{value: WAGER}(gameId);

        CoinFlip.Game memory game = coinFlip.getGame(gameId);
        assertTrue(game.player1WantsRematch);
        assertFalse(game.player2WantsRematch);
    }

    function test_RematchStartsNewGame() public {
        (uint256 gameId, address caller) = _createAndJoinGame();
        
        vm.prank(caller);
        coinFlip.callCoin(gameId, CoinFlip.CoinSide.Heads);

        CoinFlip.Game memory oldGame = coinFlip.getGame(gameId);

        vm.prank(player1);
        coinFlip.requestRematch{value: WAGER}(gameId);

        vm.prank(player2);
        coinFlip.requestRematch{value: WAGER}(gameId);

        // New game should be created
        assertEq(coinFlip.gameCounter(), 2);
        
        CoinFlip.Game memory newGame = coinFlip.getGame(2);
        assertEq(newGame.player1, player1);
        assertEq(newGame.player2, player2);
        assertEq(newGame.roundNumber, 2);
        
        // Caller should alternate
        assertEq(
            newGame.currentCaller,
            oldGame.currentCaller == player1 ? player2 : player1
        );
    }

    function test_CancelRematchRequest() public {
        (uint256 gameId, address caller) = _createAndJoinGame();
        
        vm.prank(caller);
        coinFlip.callCoin(gameId, CoinFlip.CoinSide.Heads);

        uint256 balanceBefore = player1.balance;

        vm.prank(player1);
        coinFlip.requestRematch{value: WAGER}(gameId);

        vm.prank(player1);
        coinFlip.cancelRematchRequest(gameId);

        CoinFlip.Game memory game = coinFlip.getGame(gameId);
        assertFalse(game.player1WantsRematch);
        assertEq(player1.balance, balanceBefore);
    }

    // ============ Open Games Tests ============

    function test_OpenGamesTracking() public {
        vm.prank(player1);
        coinFlip.createGame{value: WAGER}();

        vm.prank(player2);
        coinFlip.createGame{value: WAGER * 2}();

        assertEq(coinFlip.getOpenGamesCount(), 2);

        CoinFlip.Game[] memory openGames = coinFlip.getOpenGames(0, 10);
        assertEq(openGames.length, 2);
    }

    function test_OpenGamesRemovedOnJoin() public {
        vm.prank(player1);
        uint256 gameId = coinFlip.createGame{value: WAGER}();

        assertEq(coinFlip.getOpenGamesCount(), 1);

        vm.prank(player2);
        coinFlip.joinGame{value: WAGER}(gameId);

        assertEq(coinFlip.getOpenGamesCount(), 0);
    }

    function test_OpenGamesRemovedOnCancel() public {
        vm.prank(player1);
        uint256 gameId = coinFlip.createGame{value: WAGER}();

        assertEq(coinFlip.getOpenGamesCount(), 1);

        vm.prank(player1);
        coinFlip.cancelGame(gameId);

        assertEq(coinFlip.getOpenGamesCount(), 0);
    }

    function test_GetOpenGamesPagination() public {
        // Create 5 games
        for (uint i = 0; i < 5; i++) {
            vm.prank(player1);
            coinFlip.createGame{value: WAGER}();
        }

        CoinFlip.Game[] memory page1 = coinFlip.getOpenGames(0, 2);
        assertEq(page1.length, 2);

        CoinFlip.Game[] memory page2 = coinFlip.getOpenGames(2, 2);
        assertEq(page2.length, 2);

        CoinFlip.Game[] memory page3 = coinFlip.getOpenGames(4, 2);
        assertEq(page3.length, 1);
    }

    // ============ User Games Tests ============

    function test_UserGamesTracking() public {
        vm.prank(player1);
        coinFlip.createGame{value: WAGER}();

        vm.prank(player1);
        coinFlip.createGame{value: WAGER}();

        uint256[] memory player1Games = coinFlip.getUserGames(player1);
        assertEq(player1Games.length, 2);
    }

    // ============ Owner Functions Tests ============

    function test_WithdrawFees() public {
        (uint256 gameId, address caller) = _createAndJoinGame();
        
        vm.prank(caller);
        coinFlip.callCoin(gameId, CoinFlip.CoinSide.Heads);

        uint256 fees = coinFlip.collectedFees();
        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(owner);
        coinFlip.withdrawFees();

        assertEq(owner.balance, ownerBalanceBefore + fees);
        assertEq(coinFlip.collectedFees(), 0);
    }

    function test_WithdrawFees_RevertNotOwner() public {
        (uint256 gameId, address caller) = _createAndJoinGame();
        
        vm.prank(caller);
        coinFlip.callCoin(gameId, CoinFlip.CoinSide.Heads);

        vm.prank(player1);
        vm.expectRevert("Not owner");
        coinFlip.withdrawFees();
    }

    function test_TransferOwnership() public {
        vm.prank(owner);
        coinFlip.transferOwnership(player1);

        assertEq(coinFlip.owner(), player1);
    }

    // ============ Helper Functions ============

    function _createAndJoinGame() internal returns (uint256 gameId, address caller) {
        vm.prank(player1);
        gameId = coinFlip.createGame{value: WAGER}();

        vm.prank(player2);
        coinFlip.joinGame{value: WAGER}(gameId);

        CoinFlip.Game memory game = coinFlip.getGame(gameId);
        caller = game.currentCaller;
    }
}
