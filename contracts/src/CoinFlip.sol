// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CoinFlip
 * @notice A two-player coin flip wagering game on Base
 * @dev Players can create games, join games, and flip coins with ETH wagers
 */
contract CoinFlip {
    // ============ Errors ============
    error GameNotFound();
    error GameNotOpen();
    error GameNotActive();
    error GameAlreadyFull();
    error InvalidWagerAmount();
    error NotAPlayer();
    error NotYourTurn();
    error AlreadyCalled();
    error GameNotComplete();
    error InsufficientBalance();
    error TransferFailed();
    error CannotJoinOwnGame();
    error RematchNotRequested();
    error RematchAlreadyRequested();
    error WagerMismatch();

    // ============ Enums ============
    enum GameStatus {
        Open,       // Waiting for player 2
        Active,     // Both players joined, awaiting coin call
        Flipping,   // Coin call made, awaiting result
        Complete,   // Game finished
        Cancelled   // Game cancelled by creator
    }

    enum CoinSide {
        None,
        Heads,
        Tails
    }

    // ============ Structs ============
    struct Game {
        uint256 id;
        address player1;
        address player2;
        uint256 wagerAmount;
        GameStatus status;
        address currentCaller;   // Who gets to call heads/tails
        CoinSide calledSide;
        CoinSide result;
        address winner;
        uint256 roundNumber;
        uint256 createdAt;
        uint256 completedAt;
        bool player1WantsRematch;
        bool player2WantsRematch;
    }

    // ============ State Variables ============
    uint256 public gameCounter;
    uint256 public constant FEE_PERCENTAGE = 1; // 1% fee
    uint256 public constant FEE_DENOMINATOR = 100;
    address public owner;
    uint256 public collectedFees;

    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public userGames;
    
    // For pagination of open games
    uint256[] public openGameIds;
    mapping(uint256 => uint256) private openGameIndex; // gameId => index in openGameIds

    // ============ Events ============
    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 wagerAmount);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event CallerSelected(uint256 indexed gameId, address indexed caller);
    event CoinCalled(uint256 indexed gameId, address indexed caller, CoinSide side);
    event CoinFlipped(uint256 indexed gameId, CoinSide result, address indexed winner, uint256 payout);
    event GameCancelled(uint256 indexed gameId);
    event RematchRequested(uint256 indexed gameId, address indexed player);
    event RematchStarted(uint256 indexed oldGameId, uint256 indexed newGameId);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier gameExists(uint256 _gameId) {
        if (_gameId == 0 || _gameId > gameCounter) revert GameNotFound();
        _;
    }

    // ============ Constructor ============
    constructor() {
        owner = msg.sender;
    }

    // ============ External Functions ============

    /**
     * @notice Create a new game with a wager amount
     * @dev Player must send ETH equal to wager amount
     */
    function createGame() external payable returns (uint256) {
        if (msg.value == 0) revert InvalidWagerAmount();

        gameCounter++;
        uint256 gameId = gameCounter;

        Game storage game = games[gameId];
        game.id = gameId;
        game.player1 = msg.sender;
        game.wagerAmount = msg.value;
        game.status = GameStatus.Open;
        game.createdAt = block.timestamp;
        game.roundNumber = 1;

        userGames[msg.sender].push(gameId);
        
        // Add to open games list
        openGameIndex[gameId] = openGameIds.length;
        openGameIds.push(gameId);

        emit GameCreated(gameId, msg.sender, msg.value);

        return gameId;
    }

    /**
     * @notice Join an existing open game
     * @param _gameId The ID of the game to join
     */
    function joinGame(uint256 _gameId) external payable gameExists(_gameId) {
        Game storage game = games[_gameId];

        if (game.status != GameStatus.Open) revert GameNotOpen();
        if (game.player2 != address(0)) revert GameAlreadyFull();
        if (msg.sender == game.player1) revert CannotJoinOwnGame();
        if (msg.value != game.wagerAmount) revert WagerMismatch();

        game.player2 = msg.sender;
        game.status = GameStatus.Active;

        userGames[msg.sender].push(_gameId);
        
        // Remove from open games list
        _removeFromOpenGames(_gameId);

        // Randomly select who calls the coin
        game.currentCaller = _selectRandomCaller(game.player1, game.player2, _gameId);

        emit GameJoined(_gameId, msg.sender);
        emit CallerSelected(_gameId, game.currentCaller);
    }

    /**
     * @notice Call heads or tails (only the selected caller can do this)
     * @param _gameId The game ID
     * @param _side The side being called (Heads or Tails)
     */
    function callCoin(uint256 _gameId, CoinSide _side) external gameExists(_gameId) {
        Game storage game = games[_gameId];

        if (game.status != GameStatus.Active) revert GameNotActive();
        if (msg.sender != game.currentCaller) revert NotYourTurn();
        if (_side == CoinSide.None) revert InvalidWagerAmount();
        if (game.calledSide != CoinSide.None) revert AlreadyCalled();

        game.calledSide = _side;
        game.status = GameStatus.Flipping;

        emit CoinCalled(_gameId, msg.sender, _side);

        // Immediately flip the coin
        _flipCoin(_gameId);
    }

    /**
     * @notice Cancel an open game (only creator can cancel before someone joins)
     * @param _gameId The game ID to cancel
     */
    function cancelGame(uint256 _gameId) external gameExists(_gameId) {
        Game storage game = games[_gameId];

        if (game.status != GameStatus.Open) revert GameNotOpen();
        if (msg.sender != game.player1) revert NotAPlayer();

        game.status = GameStatus.Cancelled;
        
        // Remove from open games list
        _removeFromOpenGames(_gameId);

        // Refund the creator
        (bool success, ) = payable(game.player1).call{value: game.wagerAmount}("");
        if (!success) revert TransferFailed();

        emit GameCancelled(_gameId);
    }

    /**
     * @notice Request a rematch after game completion
     * @param _gameId The completed game ID
     */
    function requestRematch(uint256 _gameId) external payable gameExists(_gameId) {
        Game storage game = games[_gameId];

        if (game.status != GameStatus.Complete) revert GameNotComplete();
        if (msg.sender != game.player1 && msg.sender != game.player2) revert NotAPlayer();
        if (msg.value != game.wagerAmount) revert WagerMismatch();

        if (msg.sender == game.player1) {
            if (game.player1WantsRematch) revert RematchAlreadyRequested();
            game.player1WantsRematch = true;
        } else {
            if (game.player2WantsRematch) revert RematchAlreadyRequested();
            game.player2WantsRematch = true;
        }

        emit RematchRequested(_gameId, msg.sender);

        // If both want rematch, start new game
        if (game.player1WantsRematch && game.player2WantsRematch) {
            _startRematch(_gameId);
        }
    }

    /**
     * @notice Cancel rematch request and get refund
     * @param _gameId The game ID
     */
    function cancelRematchRequest(uint256 _gameId) external gameExists(_gameId) {
        Game storage game = games[_gameId];

        if (game.status != GameStatus.Complete) revert GameNotComplete();
        
        bool wasRequested = false;
        
        if (msg.sender == game.player1 && game.player1WantsRematch) {
            game.player1WantsRematch = false;
            wasRequested = true;
        } else if (msg.sender == game.player2 && game.player2WantsRematch) {
            game.player2WantsRematch = false;
            wasRequested = true;
        }

        if (!wasRequested) revert RematchNotRequested();

        // Refund
        (bool success, ) = payable(msg.sender).call{value: game.wagerAmount}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Withdraw collected fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = collectedFees;
        if (amount == 0) revert InsufficientBalance();
        
        collectedFees = 0;
        
        (bool success, ) = payable(owner).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit FeesWithdrawn(owner, amount);
    }

    /**
     * @notice Transfer ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    // ============ View Functions ============

    /**
     * @notice Get game details
     * @param _gameId The game ID
     */
    function getGame(uint256 _gameId) external view gameExists(_gameId) returns (Game memory) {
        return games[_gameId];
    }

    /**
     * @notice Get all games for a user
     * @param _user The user address
     */
    function getUserGames(address _user) external view returns (uint256[] memory) {
        return userGames[_user];
    }

    /**
     * @notice Get open games count
     */
    function getOpenGamesCount() external view returns (uint256) {
        return openGameIds.length;
    }

    /**
     * @notice Get open games with pagination
     * @param _offset Starting index
     * @param _limit Maximum number of games to return
     */
    function getOpenGames(uint256 _offset, uint256 _limit) external view returns (Game[] memory) {
        uint256 total = openGameIds.length;
        
        if (_offset >= total) {
            return new Game[](0);
        }

        uint256 end = _offset + _limit;
        if (end > total) {
            end = total;
        }

        uint256 count = end - _offset;
        Game[] memory result = new Game[](count);

        for (uint256 i = 0; i < count; i++) {
            result[i] = games[openGameIds[_offset + i]];
        }

        return result;
    }

    /**
     * @notice Get multiple games by IDs
     * @param _gameIds Array of game IDs
     */
    function getGamesByIds(uint256[] calldata _gameIds) external view returns (Game[] memory) {
        Game[] memory result = new Game[](_gameIds.length);
        for (uint256 i = 0; i < _gameIds.length; i++) {
            if (_gameIds[i] > 0 && _gameIds[i] <= gameCounter) {
                result[i] = games[_gameIds[i]];
            }
        }
        return result;
    }

    // ============ Internal Functions ============

    /**
     * @notice Select a random caller between two players
     * @dev Uses block data for randomness - acceptable for low-stakes games
     * @param _player1 First player address
     * @param _player2 Second player address
     * @param _gameId Game ID for additional entropy
     */
    function _selectRandomCaller(
        address _player1,
        address _player2,
        uint256 _gameId
    ) internal view returns (address) {
        // Simple randomness using block data
        // Note: For higher stakes, consider using Chainlink VRF
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    _player1,
                    _player2,
                    _gameId
                )
            )
        );

        return (random % 2 == 0) ? _player1 : _player2;
    }

    /**
     * @notice Flip the coin and determine winner
     * @param _gameId The game ID
     */
    function _flipCoin(uint256 _gameId) internal {
        Game storage game = games[_gameId];

        // Generate random result
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    game.player1,
                    game.player2,
                    game.calledSide,
                    _gameId,
                    game.roundNumber
                )
            )
        );

        game.result = (random % 2 == 0) ? CoinSide.Heads : CoinSide.Tails;

        // Determine winner
        if (game.calledSide == game.result) {
            game.winner = game.currentCaller;
        } else {
            game.winner = (game.currentCaller == game.player1) ? game.player2 : game.player1;
        }

        game.status = GameStatus.Complete;
        game.completedAt = block.timestamp;

        // Calculate payout
        uint256 totalPot = game.wagerAmount * 2;
        uint256 fee = (totalPot * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        uint256 payout = totalPot - fee;

        collectedFees += fee;

        // Pay the winner
        (bool success, ) = payable(game.winner).call{value: payout}("");
        if (!success) revert TransferFailed();

        emit CoinFlipped(_gameId, game.result, game.winner, payout);
    }

    /**
     * @notice Start a rematch game
     * @param _oldGameId The previous game ID
     */
    function _startRematch(uint256 _oldGameId) internal {
        Game storage oldGame = games[_oldGameId];

        gameCounter++;
        uint256 newGameId = gameCounter;

        Game storage newGame = games[newGameId];
        newGame.id = newGameId;
        newGame.player1 = oldGame.player1;
        newGame.player2 = oldGame.player2;
        newGame.wagerAmount = oldGame.wagerAmount;
        newGame.status = GameStatus.Active;
        newGame.createdAt = block.timestamp;
        newGame.roundNumber = oldGame.roundNumber + 1;

        // Alternate the caller - whoever didn't call last time gets to call now
        newGame.currentCaller = (oldGame.currentCaller == oldGame.player1) 
            ? oldGame.player2 
            : oldGame.player1;

        userGames[oldGame.player1].push(newGameId);
        userGames[oldGame.player2].push(newGameId);

        // Reset rematch flags on old game
        oldGame.player1WantsRematch = false;
        oldGame.player2WantsRematch = false;

        emit RematchStarted(_oldGameId, newGameId);
        emit CallerSelected(newGameId, newGame.currentCaller);
    }

    /**
     * @notice Remove a game from the open games list
     * @param _gameId The game ID to remove
     */
    function _removeFromOpenGames(uint256 _gameId) internal {
        uint256 index = openGameIndex[_gameId];
        uint256 lastIndex = openGameIds.length - 1;

        if (index != lastIndex) {
            uint256 lastGameId = openGameIds[lastIndex];
            openGameIds[index] = lastGameId;
            openGameIndex[lastGameId] = index;
        }

        openGameIds.pop();
        delete openGameIndex[_gameId];
    }

    // ============ Receive Function ============
    receive() external payable {
        // Accept ETH sent directly to contract (adds to fees)
        collectedFees += msg.value;
    }
}
