// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title NFTBattleV2
 * @notice PvP game where players battle with randomly selected NFTs from curated decks
 * @dev V2 Features:
 *   - Chainlink VRF for high-value games (threshold-based)
 *   - Epoch-based leaderboard with lazy reset and top 10 snapshots
 *   - Multi-deck architecture with versioning
 *   - Basis point fees (2.5% = 250 bps)
 *   - Minimum wager for leaderboard points
 *   - Bonus multiplier for promotional events
 */
contract NFTBattleV2 is VRFConsumerBaseV2Plus {
    // ============ Enums ============
    enum GameStatus {
        Open,           // Waiting for player2
        WaitingVRF,     // VRF requested, waiting for callback
        Complete,       // Game finished
        Cancelled       // Game was cancelled
    }

    // ============ Structs ============
    struct DeckCard {
        uint256 tokenId;
        uint256 power;      // 100-999 range (percentile-based)
    }

    struct Deck {
        address collection;
        string name;
        uint256 version;
        bool active;
        uint256 cardCount;
    }

    struct Game {
        uint256 id;
        address player1;
        address player2;
        uint256 deckId;
        uint256 wagerAmount;
        GameStatus status;
        uint256 player1TokenId;
        uint256 player2TokenId;
        uint256 player1Power;
        uint256 player2Power;
        address winner;
        uint256 roundNumber;
        uint256 createdAt;
        uint256 completedAt;
        bool player1WantsRematch;
        bool player2WantsRematch;
        bool usedVRF;           // Whether this game used Chainlink VRF
        uint256 vrfRequestId;   // VRF request ID if applicable
    }

    struct LeaderboardEntry {
        address player;
        uint256 wins;
        uint256 gamesPlayed;
    }

    // ============ Constants ============
    uint256 public constant MAX_FEE_BPS = 1000;  // 10% max fee
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Chainlink VRF Config (Base Sepolia)
    // See: https://docs.chain.link/vrf/v2-5/supported-networks#base-sepolia-testnet
    // VRF Coordinator: 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE
    bytes32 public constant KEY_HASH = 0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71;
    uint32 public constant CALLBACK_GAS_LIMIT = 500000;  // Increased for battle execution + leaderboard updates
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public constant NUM_WORDS = 1;

    // ============ State Variables ============
    // Note: owner() is inherited from VRFConsumerBaseV2Plus -> ConfirmedOwner
    uint256 public subscriptionId;  // Chainlink VRF subscription

    // Game management
    uint256 public gameCounter;
    mapping(uint256 => Game) public games;
    mapping(uint256 => uint256) public vrfRequestToGame;  // VRF requestId => gameId

    // Deck management
    uint256 public deckCounter;
    mapping(uint256 => Deck) public decks;
    mapping(uint256 => DeckCard[]) public deckCards;  // deckId => cards
    mapping(address => uint256) public collectionToDeck;  // collection => active deckId

    // Fee management
    uint256 public feeBasisPoints = 250;  // 2.5%
    uint256 public accumulatedFees;
    uint256 public vrfThreshold = 0.02 ether;  // Games >= this use VRF

    // Leaderboard - Epoch based
    uint256 public currentEpoch = 1;
    uint256 public epochEndTime;
    uint256 public minWagerForPoints = 0.0004 ether;  // ~$1
    uint256 public bonusMultiplier = 1;  // 1 = normal, 2 = double points

    mapping(uint256 => mapping(address => uint256)) public epochWins;
    mapping(uint256 => mapping(address => uint256)) public epochGamesPlayed;
    mapping(uint256 => address[]) public epochPlayers;  // epoch => player list
    mapping(uint256 => mapping(address => bool)) public epochHasPlayed;

    // All-time stats
    mapping(address => uint256) public allTimeWins;
    mapping(address => uint256) public allTimeGamesPlayed;

    // ============ Events ============
    event DeckCreated(uint256 indexed deckId, address indexed collection, string name, uint256 version);
    event DeckUpdated(uint256 indexed deckId, uint256 cardCount, uint256 version);
    event DeckStatusChanged(uint256 indexed deckId, bool active);

    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 indexed deckId, uint256 wagerAmount);
    event GameJoined(uint256 indexed gameId, address indexed player2, bool usedVRF);
    event VRFRequested(uint256 indexed gameId, uint256 requestId);
    event GameComplete(
        uint256 indexed gameId,
        address indexed winner,
        uint256 player1TokenId,
        uint256 player1Power,
        uint256 player2TokenId,
        uint256 player2Power,
        uint256 winnings,
        bool usedVRF
    );
    event GameCancelled(uint256 indexed gameId);

    event RematchRequested(uint256 indexed gameId, address indexed player);
    event RematchCreated(uint256 indexed oldGameId, uint256 indexed newGameId);
    event RematchCancelled(uint256 indexed gameId, address indexed player);

    event EpochEnded(
        uint256 indexed epochId,
        address[10] topPlayers,
        uint256[10] topWins,
        uint256 endTimestamp
    );
    event EpochStarted(uint256 indexed epochId, uint256 endTime);

    event FeesWithdrawn(address indexed owner, uint256 amount);
    event ConfigUpdated(string param, uint256 value);

    // Note: onlyOwner modifier is inherited from VRFConsumerBaseV2Plus -> ConfirmedOwner

    // ============ Constructor ============
    constructor(
        address _vrfCoordinator,
        uint256 _subscriptionId
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        // owner is set automatically by ConfirmedOwner base contract to msg.sender
        subscriptionId = _subscriptionId;
        
        // Set initial epoch end (1 week from now)
        epochEndTime = block.timestamp + 7 days;
    }

    // ============ Deck Management ============
    
    /**
     * @notice Create a new deck for a collection
     */
    function createDeck(
        address _collection,
        string calldata _name
    ) external onlyOwner returns (uint256) {
        deckCounter++;
        
        decks[deckCounter] = Deck({
            collection: _collection,
            name: _name,
            version: 1,
            active: true,
            cardCount: 0
        });
        
        collectionToDeck[_collection] = deckCounter;
        
        emit DeckCreated(deckCounter, _collection, _name, 1);
        return deckCounter;
    }

    /**
     * @notice Add cards to a deck (call multiple times for large decks)
     */
    function addDeckCards(
        uint256 _deckId,
        uint256[] calldata _tokenIds,
        uint256[] calldata _powers
    ) external onlyOwner {
        require(_tokenIds.length == _powers.length, "Array mismatch");
        require(decks[_deckId].collection != address(0), "Deck not found");
        
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            require(_powers[i] >= 100 && _powers[i] <= 999, "Power must be 100-999");
            deckCards[_deckId].push(DeckCard({
                tokenId: _tokenIds[i],
                power: _powers[i]
            }));
        }
        
        decks[_deckId].cardCount = deckCards[_deckId].length;
        emit DeckUpdated(_deckId, deckCards[_deckId].length, decks[_deckId].version);
    }

    /**
     * @notice Clear and re-version a deck (for updates)
     */
    function clearDeck(uint256 _deckId) external onlyOwner {
        require(decks[_deckId].collection != address(0), "Deck not found");
        
        delete deckCards[_deckId];
        decks[_deckId].cardCount = 0;
        decks[_deckId].version++;
        
        emit DeckUpdated(_deckId, 0, decks[_deckId].version);
    }

    /**
     * @notice Remove a single card from a deck
     */
    function removeDeckCard(uint256 _deckId, uint256 _tokenId) external onlyOwner {
        require(decks[_deckId].collection != address(0), "Deck not found");
        
        DeckCard[] storage cards = deckCards[_deckId];
        uint256 len = cards.length;
        
        for (uint256 i = 0; i < len; i++) {
            if (cards[i].tokenId == _tokenId) {
                // Swap with last and pop
                cards[i] = cards[len - 1];
                cards.pop();
                decks[_deckId].cardCount--;
                decks[_deckId].version++;
                emit DeckUpdated(_deckId, decks[_deckId].cardCount, decks[_deckId].version);
                return;
            }
        }
        revert("Card not found");
    }

    /**
     * @notice Enable/disable a deck
     */
    function setDeckActive(uint256 _deckId, bool _active) external onlyOwner {
        require(decks[_deckId].collection != address(0), "Deck not found");
        decks[_deckId].active = _active;
        emit DeckStatusChanged(_deckId, _active);
    }

    /**
     * @notice Get deck info
     */
    function getDeck(uint256 _deckId) external view returns (Deck memory, uint256 cardCount) {
        return (decks[_deckId], deckCards[_deckId].length);
    }

    /**
     * @notice Get a card from a deck
     */
    function getDeckCard(uint256 _deckId, uint256 _index) external view returns (uint256 tokenId, uint256 power) {
        require(_index < deckCards[_deckId].length, "Index out of bounds");
        DeckCard memory card = deckCards[_deckId][_index];
        return (card.tokenId, card.power);
    }

    // ============ Game Logic ============

    /**
     * @notice Create a new game
     */
    function createGame(uint256 _deckId) external payable returns (uint256) {
        require(msg.value > 0, "Wager required");
        require(decks[_deckId].active, "Deck not active");
        require(deckCards[_deckId].length >= 2, "Deck too small");
        
        gameCounter++;
        
        games[gameCounter] = Game({
            id: gameCounter,
            player1: msg.sender,
            player2: address(0),
            deckId: _deckId,
            wagerAmount: msg.value,
            status: GameStatus.Open,
            player1TokenId: 0,
            player2TokenId: 0,
            player1Power: 0,
            player2Power: 0,
            winner: address(0),
            roundNumber: 1,
            createdAt: block.timestamp,
            completedAt: 0,
            player1WantsRematch: false,
            player2WantsRematch: false,
            usedVRF: false,
            vrfRequestId: 0
        });

        emit GameCreated(gameCounter, msg.sender, _deckId, msg.value);
        return gameCounter;
    }

    /**
     * @notice Join an existing game
     */
    function joinGame(uint256 _gameId) external payable {
        Game storage game = games[_gameId];
        
        require(game.status == GameStatus.Open, "Game not open");
        require(game.player1 != msg.sender, "Cannot join own game");
        require(msg.value == game.wagerAmount, "Wrong wager amount");
        
        game.player2 = msg.sender;
        
        // Determine if we use VRF based on wager amount
        bool useVRF = game.wagerAmount >= vrfThreshold;
        game.usedVRF = useVRF;
        
        emit GameJoined(_gameId, msg.sender, useVRF);
        
        if (useVRF) {
            // Request VRF - game will complete in callback
            game.status = GameStatus.WaitingVRF;
            _requestRandomness(_gameId);
        } else {
            // Execute immediately with pseudo-random
            _executeBattle(_gameId, _generatePseudoRandom(_gameId));
        }
    }

    /**
     * @notice Generate pseudo-random number (for low-value games)
     */
    function _generatePseudoRandom(uint256 _gameId) internal view returns (uint256) {
        Game storage game = games[_gameId];
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            game.player1,
            game.player2,
            _gameId
        )));
    }

    /**
     * @notice Request VRF randomness
     */
    function _requestRandomness(uint256 _gameId) internal {
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: KEY_HASH,
                subId: subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        
        vrfRequestToGame[requestId] = _gameId;
        games[_gameId].vrfRequestId = requestId;
        
        emit VRFRequested(_gameId, requestId);
    }

    /**
     * @notice VRF callback - completes the game with verified randomness
     */
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] calldata _randomWords
    ) internal override {
        uint256 gameId = vrfRequestToGame[_requestId];
        require(gameId != 0, "Unknown request");
        require(games[gameId].status == GameStatus.WaitingVRF, "Game not waiting");
        
        _executeBattle(gameId, _randomWords[0]);
    }

    /**
     * @notice Execute the battle with given randomness
     */
    function _executeBattle(uint256 _gameId, uint256 _randomness) internal {
        Game storage game = games[_gameId];
        
        DeckCard[] storage cards = deckCards[game.deckId];
        uint256 deckSize = cards.length;
        
        // Select two different cards
        uint256 index1 = _randomness % deckSize;
        uint256 index2 = (_randomness / deckSize) % deckSize;
        if (index1 == index2) {
            index2 = (index2 + 1) % deckSize;
        }
        
        DeckCard memory card1 = cards[index1];
        DeckCard memory card2 = cards[index2];
        
        game.player1TokenId = card1.tokenId;
        game.player1Power = card1.power;
        game.player2TokenId = card2.tokenId;
        game.player2Power = card2.power;
        
        // Determine winner (ties go to player1)
        game.winner = game.player1Power >= game.player2Power ? game.player1 : game.player2;
        game.status = GameStatus.Complete;
        game.completedAt = block.timestamp;
        
        // Check for epoch reset before updating leaderboard
        _checkEpochReset();
        
        // Update leaderboard if wager meets minimum
        if (game.wagerAmount >= minWagerForPoints) {
            uint256 points = bonusMultiplier;  // Usually 1, can be 2 for events
            _updateLeaderboard(game.player1, game.winner == game.player1 ? points : 0);
            _updateLeaderboard(game.player2, game.winner == game.player2 ? points : 0);
        }
        
        // Update all-time stats
        allTimeGamesPlayed[game.player1]++;
        allTimeGamesPlayed[game.player2]++;
        allTimeWins[game.winner]++;
        
        // Calculate and pay winnings
        uint256 totalPot = game.wagerAmount * 2;
        uint256 fee = (totalPot * feeBasisPoints) / BPS_DENOMINATOR;
        uint256 winnings = totalPot - fee;
        accumulatedFees += fee;
        
        (bool success, ) = game.winner.call{value: winnings}("");
        require(success, "Transfer failed");
        
        emit GameComplete(
            _gameId,
            game.winner,
            game.player1TokenId,
            game.player1Power,
            game.player2TokenId,
            game.player2Power,
            winnings,
            game.usedVRF
        );
    }

    /**
     * @notice Cancel an open game
     */
    function cancelGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        
        require(game.status == GameStatus.Open, "Can only cancel open games");
        require(game.player1 == msg.sender, "Not game creator");
        
        game.status = GameStatus.Cancelled;
        
        (bool success, ) = msg.sender.call{value: game.wagerAmount}("");
        require(success, "Refund failed");
        
        emit GameCancelled(_gameId);
    }

    // ============ Rematch System ============

    /**
     * @notice Request a rematch
     */
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
        
        if (game.player1WantsRematch && game.player2WantsRematch) {
            _createRematch(_gameId);
        }
    }

    function _createRematch(uint256 _oldGameId) internal {
        Game storage oldGame = games[_oldGameId];
        
        gameCounter++;
        uint256 newGameId = gameCounter;
        
        // Determine if we use VRF
        bool useVRF = oldGame.wagerAmount >= vrfThreshold;
        
        // Swap players for rematch (fairer - previous player2 becomes player1)
        games[newGameId] = Game({
            id: newGameId,
            player1: oldGame.player2,  // Swapped
            player2: oldGame.player1,  // Swapped
            deckId: oldGame.deckId,
            wagerAmount: oldGame.wagerAmount,
            status: useVRF ? GameStatus.WaitingVRF : GameStatus.Open,
            player1TokenId: 0,
            player2TokenId: 0,
            player1Power: 0,
            player2Power: 0,
            winner: address(0),
            roundNumber: oldGame.roundNumber + 1,
            createdAt: block.timestamp,
            completedAt: 0,
            player1WantsRematch: false,
            player2WantsRematch: false,
            usedVRF: useVRF,
            vrfRequestId: 0
        });
        
        oldGame.player1WantsRematch = false;
        oldGame.player2WantsRematch = false;
        
        emit RematchCreated(_oldGameId, newGameId);
        emit GameJoined(newGameId, oldGame.player1, useVRF);  // Now player1 is player2
        
        if (useVRF) {
            _requestRandomness(newGameId);
        } else {
            _executeBattle(newGameId, _generatePseudoRandom(newGameId));
        }
    }

    /**
     * @notice Cancel a rematch request and get refund
     */
    function cancelRematchRequest(uint256 _gameId) external {
        Game storage game = games[_gameId];
        
        require(game.status == GameStatus.Complete, "Game not complete");
        require(msg.sender == game.player1 || msg.sender == game.player2, "Not a player");
        
        bool hadRequest = false;
        if (msg.sender == game.player1 && game.player1WantsRematch) {
            game.player1WantsRematch = false;
            hadRequest = true;
        } else if (msg.sender == game.player2 && game.player2WantsRematch) {
            game.player2WantsRematch = false;
            hadRequest = true;
        }
        
        require(hadRequest, "No request to cancel");
        
        (bool success, ) = msg.sender.call{value: game.wagerAmount}("");
        require(success, "Refund failed");
        
        emit RematchCancelled(_gameId, msg.sender);
    }

    // ============ Leaderboard System ============

    /**
     * @notice Check if epoch should reset (lazy reset)
     */
    function _checkEpochReset() internal {
        if (block.timestamp >= epochEndTime && epochEndTime > 0) {
            _endEpoch();
        }
    }

    /**
     * @notice End current epoch and emit snapshot
     */
    function _endEpoch() internal {
        // Get top 10 players
        address[10] memory topPlayers;
        uint256[10] memory topWins;
        
        address[] storage players = epochPlayers[currentEpoch];
        
        // Simple selection sort for top 10 (gas efficient for small result set)
        for (uint256 i = 0; i < 10 && i < players.length; i++) {
            uint256 maxWins = 0;
            uint256 maxIdx = 0;
            
            for (uint256 j = 0; j < players.length; j++) {
                address player = players[j];
                uint256 wins = epochWins[currentEpoch][player];
                
                // Check if already in top list
                bool alreadyAdded = false;
                for (uint256 k = 0; k < i; k++) {
                    if (topPlayers[k] == player) {
                        alreadyAdded = true;
                        break;
                    }
                }
                
                if (!alreadyAdded && wins > maxWins) {
                    maxWins = wins;
                    maxIdx = j;
                }
            }
            
            if (maxWins > 0) {
                topPlayers[i] = players[maxIdx];
                topWins[i] = maxWins;
            }
        }
        
        emit EpochEnded(currentEpoch, topPlayers, topWins, block.timestamp);
        
        // Start new epoch (default: 1 week)
        currentEpoch++;
        epochEndTime = block.timestamp + 7 days;
        
        emit EpochStarted(currentEpoch, epochEndTime);
    }

    /**
     * @notice Update leaderboard for a player
     */
    function _updateLeaderboard(address _player, uint256 _wins) internal {
        if (!epochHasPlayed[currentEpoch][_player]) {
            epochHasPlayed[currentEpoch][_player] = true;
            epochPlayers[currentEpoch].push(_player);
        }
        
        epochGamesPlayed[currentEpoch][_player]++;
        epochWins[currentEpoch][_player] += _wins;
    }

    /**
     * @notice Get current epoch leaderboard
     */
    function getLeaderboard() external view returns (
        address[] memory players,
        uint256[] memory wins,
        uint256[] memory gamesPlayed
    ) {
        address[] storage epochPlayerList = epochPlayers[currentEpoch];
        uint256 len = epochPlayerList.length;
        
        players = new address[](len);
        wins = new uint256[](len);
        gamesPlayed = new uint256[](len);
        
        for (uint256 i = 0; i < len; i++) {
            address player = epochPlayerList[i];
            players[i] = player;
            wins[i] = epochWins[currentEpoch][player];
            gamesPlayed[i] = epochGamesPlayed[currentEpoch][player];
        }
    }

    /**
     * @notice Get player stats for current epoch
     */
    function getPlayerEpochStats(address _player) external view returns (
        uint256 wins,
        uint256 gamesPlayed
    ) {
        return (
            epochWins[currentEpoch][_player],
            epochGamesPlayed[currentEpoch][_player]
        );
    }

    /**
     * @notice Get player all-time stats
     */
    function getPlayerAllTimeStats(address _player) external view returns (
        uint256 wins,
        uint256 gamesPlayed
    ) {
        return (allTimeWins[_player], allTimeGamesPlayed[_player]);
    }

    /**
     * @notice Get epoch info
     */
    function getEpochInfo() external view returns (
        uint256 epoch,
        uint256 endTime,
        uint256 timeRemaining,
        uint256 playerCount
    ) {
        return (
            currentEpoch,
            epochEndTime,
            epochEndTime > block.timestamp ? epochEndTime - block.timestamp : 0,
            epochPlayers[currentEpoch].length
        );
    }

    // ============ View Functions ============

    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    function getOpenGames() external view returns (Game[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].status == GameStatus.Open) count++;
        }
        
        Game[] memory result = new Game[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].status == GameStatus.Open) {
                result[idx++] = games[i];
            }
        }
        return result;
    }

    function getPlayerGames(address _player) external view returns (Game[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].player1 == _player || games[i].player2 == _player) count++;
        }
        
        Game[] memory result = new Game[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].player1 == _player || games[i].player2 == _player) {
                result[idx++] = games[i];
            }
        }
        return result;
    }

    // ============ Admin Functions ============

    function setEpochEndTime(uint256 _endTime) external onlyOwner {
        require(_endTime > block.timestamp, "Must be future");
        epochEndTime = _endTime;
        emit ConfigUpdated("epochEndTime", _endTime);
    }

    function setMinWagerForPoints(uint256 _minWager) external onlyOwner {
        minWagerForPoints = _minWager;
        emit ConfigUpdated("minWagerForPoints", _minWager);
    }

    function setBonusMultiplier(uint256 _multiplier) external onlyOwner {
        require(_multiplier >= 1 && _multiplier <= 10, "Multiplier 1-10");
        bonusMultiplier = _multiplier;
        emit ConfigUpdated("bonusMultiplier", _multiplier);
    }

    function setVRFThreshold(uint256 _threshold) external onlyOwner {
        vrfThreshold = _threshold;
        emit ConfigUpdated("vrfThreshold", _threshold);
    }

    function setFeeBasisPoints(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");
        feeBasisPoints = _feeBps;
        emit ConfigUpdated("feeBasisPoints", _feeBps);
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = accumulatedFees;
        require(amount > 0, "No fees");
        
        accumulatedFees = 0;
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdraw failed");
        
        emit FeesWithdrawn(owner(), amount);
    }

    // Note: transferOwnership() is inherited from VRFConsumerBaseV2Plus -> ConfirmedOwner

    function setSubscriptionId(uint256 _subscriptionId) external onlyOwner {
        subscriptionId = _subscriptionId;
    }

    /**
     * @notice Force end epoch (admin override)
     */
    function forceEndEpoch() external onlyOwner {
        _endEpoch();
    }

    /**
     * @notice Manually trigger epoch reset check
     */
    function triggerEpochCheck() external {
        _checkEpochReset();
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
