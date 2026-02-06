// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title NFTBattle
 * @notice PvP game where players battle with randomly selected NFTs from curated decks
 * @dev Power levels based on trait rarity determine the winner
 */
contract NFTBattle {
    // ============ Enums ============
    enum GameStatus {
        Open,       // Waiting for player2
        Active,     // Player2 joined, waiting for draw
        Drawing,    // Draw initiated, waiting for next block
        Complete,   // Game finished
        Cancelled   // Game was cancelled
    }

    // ============ Structs ============
    struct Collection {
        uint256 deckSize;       // Number of NFTs in the curated deck
        string name;            // Display name
        bool active;            // Whether collection is available for games
    }

    struct DeckCard {
        uint256 tokenId;
        uint256 powerLevel;
    }

    struct Game {
        uint256 id;
        address player1;
        address player2;
        address collection;     // NFT collection being used
        uint256 wagerAmount;
        GameStatus status;
        address currentDrawer;  // Who will trigger the draw
        uint256 player1TokenId; // Randomly selected NFT for player1
        uint256 player2TokenId; // Randomly selected NFT for player2
        uint256 player1Power;   // Power level of player1's NFT
        uint256 player2Power;   // Power level of player2's NFT
        address winner;
        uint256 roundNumber;
        uint256 createdAt;
        uint256 completedAt;
        bool player1WantsRematch;
        bool player2WantsRematch;
    }

    // ============ State Variables ============
    address public owner;
    uint256 public gameCounter;
    uint256 public feePercent = 1; // 1% fee on winnings
    uint256 public accumulatedFees;

    mapping(uint256 => Game) public games;
    mapping(address => Collection) public collections;
    address[] public collectionList;
    
    // Deck storage: collection => array of (tokenId, powerLevel)
    mapping(address => DeckCard[]) public decks;
    
    // Leaderboard tracking
    mapping(address => uint256) public playerWins;
    mapping(address => uint256) public playerGamesPlayed;
    address[] public leaderboardPlayers; // All players who have played
    mapping(address => bool) public hasPlayed; // Track if player is in leaderboard array

    // ============ Events ============
    event CollectionAdded(address indexed collection, string name, uint256 deckSize);
    event CollectionUpdated(address indexed collection, bool active);
    event DeckUpdated(address indexed collection, uint256 deckSize);
    event GameCreated(uint256 indexed gameId, address indexed player1, address indexed collection, uint256 wagerAmount);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event DrawInitiated(uint256 indexed gameId, address indexed drawer);
    event GameComplete(
        uint256 indexed gameId, 
        address indexed winner, 
        uint256 player1TokenId, 
        uint256 player1Power,
        uint256 player2TokenId, 
        uint256 player2Power,
        uint256 winnings
    );
    event GameCancelled(uint256 indexed gameId);
    event RematchRequested(uint256 indexed gameId, address indexed player);
    event RematchCreated(uint256 indexed oldGameId, uint256 indexed newGameId);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ============ Constructor ============
    constructor() {
        owner = msg.sender;
        
        // Initialize with re:generates collection on Base mainnet
        // Contract: 0x56dFE6ae26bf3043DC8Fdf33bF739B4fF4B3BC4A
        address regenerates = 0x56dFE6ae26bf3043DC8Fdf33bF739B4fF4B3BC4A;
        collections[regenerates] = Collection({
            deckSize: 0,  // Will be set when deck is loaded
            name: "re:generates",
            active: true
        });
        collectionList.push(regenerates);
    }

    // ============ Deck Management ============
    
    /**
     * @notice Add cards to a collection's deck
     * @dev Call multiple times if deck is large to avoid gas limits
     */
    function addDeckCards(
        address _collection, 
        uint256[] calldata _tokenIds, 
        uint256[] calldata _powerLevels
    ) external onlyOwner {
        require(_tokenIds.length == _powerLevels.length, "Array length mismatch");
        require(bytes(collections[_collection].name).length > 0, "Collection not found");
        
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            decks[_collection].push(DeckCard({
                tokenId: _tokenIds[i],
                powerLevel: _powerLevels[i]
            }));
        }
        
        collections[_collection].deckSize = decks[_collection].length;
        emit DeckUpdated(_collection, decks[_collection].length);
    }
    
    /**
     * @notice Clear a collection's deck (before re-uploading)
     */
    function clearDeck(address _collection) external onlyOwner {
        delete decks[_collection];
        collections[_collection].deckSize = 0;
        emit DeckUpdated(_collection, 0);
    }
    
    /**
     * @notice Get deck size for a collection
     */
    function getDeckSize(address _collection) external view returns (uint256) {
        return decks[_collection].length;
    }
    
    /**
     * @notice Get a card from the deck
     */
    function getDeckCard(address _collection, uint256 _index) external view returns (uint256 tokenId, uint256 powerLevel) {
        require(_index < decks[_collection].length, "Index out of bounds");
        DeckCard memory card = decks[_collection][_index];
        return (card.tokenId, card.powerLevel);
    }

    // ============ Collection Management ============
    function addCollection(address _collection, string calldata _name) external onlyOwner {
        require(collections[_collection].deckSize == 0 && bytes(collections[_collection].name).length == 0, "Collection exists");
        
        collections[_collection] = Collection({
            deckSize: 0,
            name: _name,
            active: true
        });
        collectionList.push(_collection);
        
        emit CollectionAdded(_collection, _name, 0);
    }

    function setCollectionActive(address _collection, bool _active) external onlyOwner {
        require(bytes(collections[_collection].name).length > 0, "Collection not found");
        collections[_collection].active = _active;
        emit CollectionUpdated(_collection, _active);
    }

    function getCollections() external view returns (address[] memory, Collection[] memory) {
        Collection[] memory cols = new Collection[](collectionList.length);
        for (uint i = 0; i < collectionList.length; i++) {
            cols[i] = collections[collectionList[i]];
        }
        return (collectionList, cols);
    }

    // ============ Game Logic ============
    function createGame(address _collection) external payable returns (uint256) {
        require(msg.value > 0, "Wager required");
        require(collections[_collection].active, "Collection not available");
        require(decks[_collection].length >= 2, "Deck not loaded");
        
        gameCounter++;
        
        games[gameCounter] = Game({
            id: gameCounter,
            player1: msg.sender,
            player2: address(0),
            collection: _collection,
            wagerAmount: msg.value,
            status: GameStatus.Open,
            currentDrawer: address(0),
            player1TokenId: 0,
            player2TokenId: 0,
            player1Power: 0,
            player2Power: 0,
            winner: address(0),
            roundNumber: 1,
            createdAt: block.timestamp,
            completedAt: 0,
            player1WantsRematch: false,
            player2WantsRematch: false
        });

        emit GameCreated(gameCounter, msg.sender, _collection, msg.value);
        return gameCounter;
    }

    function joinGame(uint256 _gameId) external payable {
        Game storage game = games[_gameId];
        
        require(game.status == GameStatus.Open, "Game not open");
        require(game.player1 != msg.sender, "Cannot join own game");
        require(msg.value == game.wagerAmount, "Wrong wager amount");
        
        game.player2 = msg.sender;
        
        emit GameJoined(_gameId, msg.sender);
        
        // Auto-execute the battle immediately
        _executeBattle(_gameId);
    }

    function _executeBattle(uint256 _gameId) internal {
        Game storage game = games[_gameId];
        
        game.status = GameStatus.Drawing;
        emit DrawInitiated(_gameId, game.player2);
        
        // Get the deck for this collection
        DeckCard[] storage deck = decks[game.collection];
        uint256 deckSize = deck.length;
        require(deckSize >= 2, "Deck too small");
        
        // Random number generation using block data
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            game.player1,
            game.player2,
            _gameId
        )));
        
        // Select random cards from deck
        uint256 index1 = randomSeed % deckSize;
        uint256 index2 = (randomSeed / deckSize) % deckSize;
        
        // Ensure different cards (re-roll if same)
        if (index1 == index2) {
            index2 = (index2 + 1) % deckSize;
        }
        
        // Get the cards
        DeckCard memory card1 = deck[index1];
        DeckCard memory card2 = deck[index2];
        
        game.player1TokenId = card1.tokenId;
        game.player1Power = card1.powerLevel;
        game.player2TokenId = card2.tokenId;
        game.player2Power = card2.powerLevel;
        
        // Determine winner - higher power wins
        // In case of tie, player1 wins (first-mover advantage / house edge)
        if (game.player1Power >= game.player2Power) {
            game.winner = game.player1;
        } else {
            game.winner = game.player2;
        }
        
        game.status = GameStatus.Complete;
        game.completedAt = block.timestamp;
        
        // Update leaderboard
        _updateLeaderboard(game.player1);
        _updateLeaderboard(game.player2);
        playerWins[game.winner]++;
        
        // Calculate winnings (total pot minus fee)
        uint256 totalPot = game.wagerAmount * 2;
        uint256 fee = (totalPot * feePercent) / 100;
        uint256 winnings = totalPot - fee;
        accumulatedFees += fee;
        
        // Pay winner
        (bool success, ) = game.winner.call{value: winnings}("");
        require(success, "Transfer failed");
        
        emit GameComplete(
            _gameId, 
            game.winner, 
            game.player1TokenId, 
            game.player1Power,
            game.player2TokenId, 
            game.player2Power,
            winnings
        );
    }

    // Legacy draw function - kept for interface compatibility but no longer needed
    function draw(uint256 _gameId) external {
        revert("Draw is automatic on join");
    }

    function cancelGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        
        require(game.status == GameStatus.Open, "Can only cancel open games");
        require(game.player1 == msg.sender, "Not game creator");
        
        game.status = GameStatus.Cancelled;
        
        // Refund player1
        (bool success, ) = msg.sender.call{value: game.wagerAmount}("");
        require(success, "Refund failed");
        
        emit GameCancelled(_gameId);
    }

    // ============ Rematch System ============
    function requestRematch(uint256 _gameId) external payable {
        Game storage game = games[_gameId];
        
        require(game.status == GameStatus.Complete, "Game not complete");
        require(msg.sender == game.player1 || msg.sender == game.player2, "Not a player");
        require(msg.value == game.wagerAmount, "Wrong wager amount");
        
        if (msg.sender == game.player1) {
            require(!game.player1WantsRematch, "Already requested");
            game.player1WantsRematch = true;
        } else {
            require(!game.player2WantsRematch, "Already requested");
            game.player2WantsRematch = true;
        }
        
        emit RematchRequested(_gameId, msg.sender);
        
        // If both want rematch, create new game
        if (game.player1WantsRematch && game.player2WantsRematch) {
            _createRematch(_gameId);
        }
    }

    function _createRematch(uint256 _oldGameId) internal {
        Game storage oldGame = games[_oldGameId];
        
        gameCounter++;
        uint256 newGameId = gameCounter;
        
        games[newGameId] = Game({
            id: newGameId,
            player1: oldGame.player1,
            player2: oldGame.player2,
            collection: oldGame.collection,
            wagerAmount: oldGame.wagerAmount,
            status: GameStatus.Open, // Will be updated by _executeBattle
            currentDrawer: address(0),
            player1TokenId: 0,
            player2TokenId: 0,
            player1Power: 0,
            player2Power: 0,
            winner: address(0),
            roundNumber: oldGame.roundNumber + 1,
            createdAt: block.timestamp,
            completedAt: 0,
            player1WantsRematch: false,
            player2WantsRematch: false
        });
        
        // Reset old game rematch flags
        oldGame.player1WantsRematch = false;
        oldGame.player2WantsRematch = false;
        
        emit RematchCreated(_oldGameId, newGameId);
        emit GameJoined(newGameId, oldGame.player2);
        
        // Auto-execute the battle immediately
        _executeBattle(newGameId);
    }

    function cancelRematchRequest(uint256 _gameId) external {
        Game storage game = games[_gameId];
        
        require(game.status == GameStatus.Complete, "Game not complete");
        require(msg.sender == game.player1 || msg.sender == game.player2, "Not a player");
        
        uint256 refundAmount = game.wagerAmount;
        
        if (msg.sender == game.player1) {
            require(game.player1WantsRematch, "No request to cancel");
            game.player1WantsRematch = false;
        } else {
            require(game.player2WantsRematch, "No request to cancel");
            game.player2WantsRematch = false;
        }
        
        // Refund the rematch wager
        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund failed");
    }

    // ============ View Functions ============
    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    function getOpenGames() external view returns (Game[] memory) {
        uint256 openCount = 0;
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].status == GameStatus.Open) {
                openCount++;
            }
        }
        
        Game[] memory openGames = new Game[](openCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].status == GameStatus.Open) {
                openGames[index] = games[i];
                index++;
            }
        }
        
        return openGames;
    }

    function getPlayerGames(address _player) external view returns (Game[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].player1 == _player || games[i].player2 == _player) {
                count++;
            }
        }
        
        Game[] memory playerGames = new Game[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].player1 == _player || games[i].player2 == _player) {
                playerGames[index] = games[i];
                index++;
            }
        }
        
        return playerGames;
    }

    // ============ Leaderboard Functions ============
    function _updateLeaderboard(address _player) internal {
        playerGamesPlayed[_player]++;
        if (!hasPlayed[_player]) {
            hasPlayed[_player] = true;
            leaderboardPlayers.push(_player);
        }
    }
    
    /**
     * @notice Get leaderboard data for all players
     * @return players Array of player addresses
     * @return wins Array of wins for each player
     * @return gamesPlayed Array of games played for each player
     */
    function getLeaderboard() external view returns (
        address[] memory players,
        uint256[] memory wins,
        uint256[] memory gamesPlayed
    ) {
        uint256 len = leaderboardPlayers.length;
        players = new address[](len);
        wins = new uint256[](len);
        gamesPlayed = new uint256[](len);
        
        for (uint256 i = 0; i < len; i++) {
            address player = leaderboardPlayers[i];
            players[i] = player;
            wins[i] = playerWins[player];
            gamesPlayed[i] = playerGamesPlayed[player];
        }
        return (players, wins, gamesPlayed);
    }
    
    /**
     * @notice Get stats for a specific player
     */
    function getPlayerStats(address _player) external view returns (uint256 wins, uint256 gamesPlayed) {
        return (playerWins[_player], playerGamesPlayed[_player]);
    }
    
    /**
     * @notice Reset leaderboard (for periodic resets)
     */
    function resetLeaderboard() external onlyOwner {
        for (uint256 i = 0; i < leaderboardPlayers.length; i++) {
            address player = leaderboardPlayers[i];
            playerWins[player] = 0;
            playerGamesPlayed[player] = 0;
            hasPlayed[player] = false;
        }
        delete leaderboardPlayers;
    }

    // ============ Admin Functions ============
    function withdrawFees() external onlyOwner {
        uint256 amount = accumulatedFees;
        require(amount > 0, "No fees to withdraw");
        
        accumulatedFees = 0;
        
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Withdraw failed");
        
        emit FeesWithdrawn(owner, amount);
    }

    function setFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 10, "Fee too high"); // Max 10%
        feePercent = _feePercent;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
