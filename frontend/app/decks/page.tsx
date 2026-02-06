"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { NFT_BATTLE_V2_ADDRESS, nftBattleV2Abi } from "@/lib/nftBattleV2Contract";
import Link from "next/link";

interface DeckInfo {
  collection: string;
  name: string;
  active: boolean;
  cardCount: number;
}

export default function DecksPage() {
  const [decks, setDecks] = useState<(DeckInfo & { id: number })[]>([]);

  // Get deck counter
  const { data: deckCounter } = useReadContract({
    address: NFT_BATTLE_V2_ADDRESS,
    abi: nftBattleV2Abi,
    functionName: "deckCounter",
  });

  // Fetch deck info for each deck
  useEffect(() => {
    async function fetchDecks() {
      if (!deckCounter) return;
      
      const deckPromises = [];
      for (let i = 1; i <= Number(deckCounter); i++) {
        deckPromises.push(
          fetch(`/api/deck/${i}`).then(r => r.json()).catch(() => null)
        );
      }
      
      // For now, use static data since we know deck 1 exists
      setDecks([{
        id: 1,
        collection: "0x56dFE6ae26bf3043DC8Fdf33bF739B4fF4B3BC4A",
        name: "re:generates",
        active: true,
        cardCount: 200,
      }]);
    }
    
    fetchDecks();
  }, [deckCounter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 bg-gray-900/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">⚔️</span>
            <span className="text-xl font-bold">re:battle</span>
          </Link>
          <Link href="/" className="text-gray-400 hover:text-white text-sm">
            ← Back to Lobby
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎴 Deck Library</h1>
          <p className="text-gray-400">
            Explore all available decks and their cards. Full transparency on power levels.
          </p>
        </div>

        <div className="grid gap-6">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={`/decks/${deck.id}`}
              className="block bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{deck.name}</h2>
                  <p className="text-gray-400 text-sm font-mono">
                    {deck.collection.slice(0, 6)}...{deck.collection.slice(-4)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-400">{deck.cardCount}</div>
                  <div className="text-gray-400 text-sm">cards</div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  deck.active 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {deck.active ? "✅ Active" : "❌ Inactive"}
                </span>
                <span className="text-gray-500 text-sm">
                  Power Range: 100 - 999
                </span>
              </div>
              
              <div className="mt-4 text-purple-400 text-sm">
                View all cards →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
