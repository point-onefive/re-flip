"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther } from "viem";
import { nftBattleV2Abi, NFT_BATTLE_V2_ADDRESS, Deck } from "@/lib/nftBattleV2Contract";
import { useEthPrice, formatUsd } from "@/hooks/useEthPrice";
import { useRouter } from "next/navigation";

interface CreateBattleModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onGameCreated: () => void;
}

export function CreateBattleModalV2({ isOpen, onClose, onGameCreated }: CreateBattleModalV2Props) {
  const [wagerAmount, setWagerAmount] = useState("0.001");
  const [selectedDeckId, setSelectedDeckId] = useState<bigint>(BigInt(1));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { address } = useAccount();
  const { ethPrice } = useEthPrice();
  const router = useRouter();
  
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Get available decks
  const { data: deckCount } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "deckCount",
  });

  // Fetch all decks
  const [decks, setDecks] = useState<Map<bigint, Deck>>(new Map());
  
  // We'll fetch decks one at a time using a single read contract for now
  // In production, you'd use multicall
  const { data: deck1 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "decks",
    args: [BigInt(1)],
  });

  const { data: deck2 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "decks",
    args: [BigInt(2)],
  });

  const { data: deck3 } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "decks",
    args: [BigInt(3)],
  });

  // Build decks list
  useEffect(() => {
    const newDecks = new Map<bigint, Deck>();
    
    if (deck1 && (deck1 as Deck).active) {
      newDecks.set(BigInt(1), deck1 as Deck);
    }
    if (deck2 && (deck2 as Deck).active) {
      newDecks.set(BigInt(2), deck2 as Deck);
    }
    if (deck3 && (deck3 as Deck).active) {
      newDecks.set(BigInt(3), deck3 as Deck);
    }
    
    setDecks(newDecks);
    
    // Set default selection to first active deck
    if (newDecks.size > 0 && !newDecks.has(selectedDeckId)) {
      const firstDeckId = newDecks.keys().next().value;
      if (firstDeckId !== undefined) {
        setSelectedDeckId(firstDeckId);
      }
    }
  }, [deck1, deck2, deck3, selectedDeckId]);

  // Get current game counter to know the new game ID
  const { data: gameCounter } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "gameCounter",
  });

  const handleCreateGame = async () => {
    if (!address || !wagerAmount || !selectedDeckId) return;

    try {
      writeContract({
        address: NFT_BATTLE_V2_ADDRESS,
        abi: nftBattleV2Abi,
        functionName: "createGame",
        args: [selectedDeckId],
        value: parseEther(wagerAmount),
      });
    } catch (err) {
      console.error("Error creating battle:", err);
    }
  };

  // Track the counter before we create so we know the new game ID
  const [counterBeforeCreate, setCounterBeforeCreate] = useState<bigint | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newGameId, setNewGameId] = useState<string | null>(null);

  // Store counter before starting transaction
  useEffect(() => {
    if (isPending && gameCounter !== undefined && counterBeforeCreate === null) {
      setCounterBeforeCreate(gameCounter as bigint);
    }
  }, [isPending, gameCounter, counterBeforeCreate]);

  // Redirect to new game on success with transition
  useEffect(() => {
    if (isSuccess && counterBeforeCreate !== null && !showSuccess) {
      const gameId = counterBeforeCreate + BigInt(1);
      setNewGameId(gameId.toString());
      setShowSuccess(true);
      onGameCreated();
      
      setTimeout(() => {
        reset();
        setCounterBeforeCreate(null);
        setShowSuccess(false);
        setNewGameId(null);
        onClose();
        router.push(`/battle/${gameId.toString()}`);
      }, 1500);
    }
  }, [isSuccess, counterBeforeCreate, onGameCreated, onClose, router, reset, showSuccess]);

  if (!isOpen) return null;

  const selectedDeck = decks.get(selectedDeckId);
  const feePercent = 2.5; // V2 uses 2.5% fee

  // Show success transition overlay
  if (showSuccess && newGameId) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-700 max-w-xs">
          <div className="text-5xl mb-4">⚔️</div>
          <div className="text-white text-xl font-bold mb-2">Battle Created!</div>
          <div className="text-gray-400 mb-4">Redirecting to Battle #{newGameId}...</div>
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-gray-900 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md sm:mx-4 border-t sm:border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">Create New Battle</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl p-1 -mr-1"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Deck Selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Card Deck
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-left flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span>{selectedDeck?.name || "Select deck"}</span>
                  {selectedDeck && (
                    <span className="text-xs text-gray-500">
                      {Number(selectedDeck.cardCount).toLocaleString()} cards
                    </span>
                  )}
                </div>
                <svg className={`h-5 w-5 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden z-10 shadow-xl max-h-60 overflow-y-auto">
                  {decks.size === 0 ? (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      No decks available
                    </div>
                  ) : (
                    Array.from(decks.entries()).map(([deckId, deck]) => (
                      <button
                        key={deckId.toString()}
                        type="button"
                        onClick={() => {
                          setSelectedDeckId(deckId);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                          selectedDeckId === deckId ? "text-purple-400 bg-gray-700/50" : "text-white"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{deck.name}</span>
                          <span className="text-xs text-gray-500">
                            {Number(deck.cardCount).toLocaleString()} cards
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Wager Amount (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              min="0.0001"
              value={wagerAmount}
              onChange={(e) => setWagerAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              placeholder="0.01"
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Your Wager</span>
              <div className="text-right">
                <span className="text-white">{wagerAmount} ETH</span>
                {ethPrice && (
                  <span className="text-gray-500 ml-2">
                    ({formatUsd(parseFloat(wagerAmount || "0"), ethPrice)})
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Potential Win</span>
              <div className="text-right">
                <span className="text-green-400">
                  {(parseFloat(wagerAmount || "0") * 2 * (1 - feePercent / 100)).toFixed(6)} ETH
                </span>
                {ethPrice && (
                  <span className="text-green-400/60 ml-2">
                    ({formatUsd(parseFloat(wagerAmount || "0") * 2 * (1 - feePercent / 100), ethPrice)})
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Platform Fee ({feePercent}%)</span>
              <div className="text-right">
                <span className="text-gray-500">
                  {(parseFloat(wagerAmount || "0") * 2 * feePercent / 100).toFixed(6)} ETH
                </span>
                {ethPrice && (
                  <span className="text-gray-600 ml-2">
                    ({formatUsd(parseFloat(wagerAmount || "0") * 2 * feePercent / 100, ethPrice)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* VRF Notice */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-400 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>
                High-value battles use Chainlink VRF for provably fair randomness
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
              {error.message}
            </div>
          )}

          <button
            onClick={handleCreateGame}
            disabled={isPending || isConfirming || !wagerAmount || decks.size === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isPending
              ? "Confirm in Wallet..."
              : isConfirming
              ? "Creating Battle..."
              : "Create Battle"}
          </button>
        </div>
      </div>
    </div>
  );
}
