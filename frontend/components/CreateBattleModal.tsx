"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther } from "viem";
import { nftBattleABI, NFT_BATTLE_CONTRACT_ADDRESS, KNOWN_COLLECTIONS } from "@/lib/nftBattleContract";
import { useEthPrice, formatUsd } from "@/hooks/useEthPrice";
import { useRouter } from "next/navigation";

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameCreated: () => void;
}

export function CreateBattleModal({ isOpen, onClose, onGameCreated }: CreateBattleModalProps) {
  const [wagerAmount, setWagerAmount] = useState("0.001");
  const [selectedCollection, setSelectedCollection] = useState<string>(Object.keys(KNOWN_COLLECTIONS)[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { address } = useAccount();
  const { ethPrice } = useEthPrice();
  const router = useRouter();
  
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Get current game counter to know the new game ID
  const { data: gameCounter, refetch: refetchCounter } = useReadContract({
    address: NFT_BATTLE_CONTRACT_ADDRESS,
    abi: nftBattleABI,
    functionName: "gameCounter",
  });

  const handleCreateGame = async () => {
    if (!address || !wagerAmount || !selectedCollection) return;

    try {
      writeContract({
        address: NFT_BATTLE_CONTRACT_ADDRESS,
        abi: nftBattleABI,
        functionName: "createGame",
        args: [selectedCollection as `0x${string}`],
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
      setCounterBeforeCreate(gameCounter);
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
          {/* Collection Selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              NFT Collection
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-left flex items-center justify-between"
              >
                <span>{KNOWN_COLLECTIONS[selectedCollection]?.name || "Select collection"}</span>
                <svg className={`h-5 w-5 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden z-10 shadow-xl">
                  {Object.entries(KNOWN_COLLECTIONS).map(([addr, config]) => (
                    <button
                      key={addr}
                      type="button"
                      onClick={() => {
                        setSelectedCollection(addr);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                        selectedCollection === addr ? "text-purple-400 bg-gray-700/50" : "text-white"
                      }`}
                    >
                      {config.name}
                    </button>
                  ))}
                  <div className="px-4 py-3 text-gray-500 text-sm border-t border-gray-700 cursor-not-allowed">
                    more coming soon
                  </div>
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
                  {(parseFloat(wagerAmount || "0") * 2 * 0.99).toFixed(6)} ETH
                </span>
                {ethPrice && (
                  <span className="text-green-400/60 ml-2">
                    ({formatUsd(parseFloat(wagerAmount || "0") * 2 * 0.99, ethPrice)})
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Platform Fee (1%)</span>
              <div className="text-right">
                <span className="text-gray-500">
                  {(parseFloat(wagerAmount || "0") * 2 * 0.01).toFixed(6)} ETH
                </span>
                {ethPrice && (
                  <span className="text-gray-600 ml-2">
                    ({formatUsd(parseFloat(wagerAmount || "0") * 2 * 0.01, ethPrice)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
              {error.message}
            </div>
          )}

          <button
            onClick={handleCreateGame}
            disabled={isPending || isConfirming || !wagerAmount}
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
