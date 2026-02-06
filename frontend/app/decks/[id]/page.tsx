"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface CardData {
  tokenId: string;
  power: number;
  image?: string;
  name?: string;
  traits?: { trait_type: string; value: string }[];
  loading?: boolean;
}

interface DeckMetadata {
  name: string;
  collection: string;
  description?: string;
}

// Power tier definitions
const POWER_TIERS = [
  { name: "LEGENDARY", min: 950, max: 999, color: "from-yellow-400 to-orange-500", bg: "bg-yellow-500/20", text: "text-yellow-400" },
  { name: "EPIC", min: 850, max: 949, color: "from-purple-400 to-purple-600", bg: "bg-purple-500/20", text: "text-purple-400" },
  { name: "RARE", min: 700, max: 849, color: "from-blue-400 to-blue-600", bg: "bg-blue-500/20", text: "text-blue-400" },
  { name: "UNCOMMON", min: 500, max: 699, color: "from-green-400 to-green-600", bg: "bg-green-500/20", text: "text-green-400" },
  { name: "COMMON", min: 300, max: 499, color: "from-gray-300 to-gray-500", bg: "bg-gray-500/20", text: "text-gray-300" },
  { name: "BASIC", min: 100, max: 299, color: "from-gray-500 to-gray-700", bg: "bg-gray-600/20", text: "text-gray-400" },
];

function getTier(power: number) {
  return POWER_TIERS.find(t => power >= t.min && power <= t.max) || POWER_TIERS[5];
}

// Deck metadata (local cache only - no external API calls)
const DECK_METADATA: Record<string, DeckMetadata> = {
  "1": {
    name: "re:generates",
    collection: "0x56dFE6ae26bf3043DC8Fdf33bF739B4fF4B3BC4A",
    description: "The re:generates collection - 200 unique NFTs with trait-based power levels. Rarer traits = higher power.",
  }
};

export default function DeckDetailPage() {
  const params = useParams();
  const deckId = params.id as string;
  
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"power" | "tokenId">("power");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  
  const metadata = DECK_METADATA[deckId] || { 
    name: `Deck #${deckId}`, 
    collection: "Unknown",
  };

  // Load power map and cached metadata
  useEffect(() => {
    async function loadCards() {
      try {
        // Load the power map JSON
        const powerMapRes = await fetch("/data/decks/re_generates_power_map.json");
        const powerMap: Record<string, number> = await powerMapRes.json();
        
        // Load cached metadata (images stored locally)
        const metadataRes = await fetch("/data/decks/re_generates_metadata.json");
        const cachedMetadata: Record<string, { name: string; image: string; attributes: { trait_type: string; value: string }[] }> = 
          await metadataRes.json();
        
        // Create card entries with cached images
        const cardList: CardData[] = Object.entries(powerMap).map(([tokenId, power]) => {
          const cached = cachedMetadata[tokenId];
          return {
            tokenId,
            power,
            name: cached?.name || `Regen #${tokenId}`,
            image: cached?.image,
            traits: cached?.attributes,
            loading: false,
          };
        });
        
        setCards(cardList);
      } catch (err) {
        console.error("Failed to load cards:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadCards();
  }, [deckId]);

  // Calculate stats
  const stats = useMemo(() => {
    if (cards.length === 0) return null;
    
    const powers = cards.map(c => c.power);
    const tierCounts = POWER_TIERS.map(tier => ({
      ...tier,
      count: cards.filter(c => c.power >= tier.min && c.power <= tier.max).length
    }));
    
    return {
      total: cards.length,
      avgPower: Math.round(powers.reduce((a, b) => a + b, 0) / powers.length),
      minPower: Math.min(...powers),
      maxPower: Math.max(...powers),
      tierCounts,
    };
  }, [cards]);

  // Filtered and sorted cards
  const displayedCards = useMemo(() => {
    let result = [...cards];
    
    // Filter by tier
    if (filter !== "all") {
      const tier = POWER_TIERS.find(t => t.name === filter);
      if (tier) {
        result = result.filter(c => c.power >= tier.min && c.power <= tier.max);
      }
    }
    
    // Search
    if (searchQuery) {
      result = result.filter(c => 
        c.tokenId.includes(searchQuery) || 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort
    result.sort((a, b) => {
      const aVal = sortBy === "power" ? a.power : parseInt(a.tokenId);
      const bVal = sortBy === "power" ? b.power : parseInt(b.tokenId);
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    
    return result;
  }, [cards, filter, sortBy, sortDir, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading deck...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/decks" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Decks
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">{metadata.name}</h1>
          <p className="text-gray-400 font-mono text-sm mb-2">
            {metadata.collection}
          </p>
          {metadata.description && (
            <p className="text-gray-300">{metadata.description}</p>
          )}
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-gray-400 text-sm">Total Cards</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.avgPower}</div>
              <div className="text-gray-400 text-sm">Avg Power</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{stats.minPower}</div>
              <div className="text-gray-400 text-sm">Min Power</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.maxPower}</div>
              <div className="text-gray-400 text-sm">Max Power</div>
            </div>
          </div>
        )}

        {/* Tier Distribution */}
        {stats && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Power Distribution</h2>
            <div className="space-y-3">
              {stats.tierCounts.map((tier) => (
                <div key={tier.name} className="flex items-center gap-4">
                  <div className={`w-28 font-bold ${tier.text}`}>{tier.name}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${tier.color} flex items-center justify-end pr-2`}
                      style={{ width: `${(tier.count / stats.total) * 100}%` }}
                    >
                      {tier.count > 0 && (
                        <span className="text-xs font-bold text-white/90">{tier.count}</span>
                      )}
                    </div>
                  </div>
                  <div className="w-16 text-right text-gray-400 text-sm">
                    {((tier.count / stats.total) * 100).toFixed(1)}%
                  </div>
                  <div className="w-24 text-right text-gray-500 text-xs">
                    {tier.min}-{tier.max}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Filter by Tier</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Tiers</option>
              {POWER_TIERS.map(tier => (
                <option key={tier.name} value={tier.name}>{tier.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-gray-400 text-sm block mb-1">Sort By</label>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split("-");
                setSortBy(by as "power" | "tokenId");
                setSortDir(dir as "asc" | "desc");
              }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="power-desc">Power (High → Low)</option>
              <option value="power-asc">Power (Low → High)</option>
              <option value="tokenId-asc">Token ID (Low → High)</option>
              <option value="tokenId-desc">Token ID (High → Low)</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="text-gray-400 text-sm block mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Token ID or name..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="text-gray-400 mb-4">
          Showing {displayedCards.length} of {cards.length} cards
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {displayedCards.map((card) => {
            const tier = getTier(card.power);
            return (
              <div
                key={card.tokenId}
                onClick={() => setSelectedCard(card)}
                className={`relative bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group cursor-pointer`}
              >
                {/* Image */}
                <div className="aspect-square relative bg-gray-900">
                  {card.loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <Image
                      src={card.image || "/placeholder.svg"}
                      alt={card.name || `Token #${card.tokenId}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  {/* Power badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg bg-gradient-to-r ${tier.color} text-white font-bold text-sm shadow-lg`}>
                    {card.power}
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-3">
                  <div className="font-bold text-white text-sm truncate">
                    {card.name || `#${card.tokenId}`}
                  </div>
                  <div className={`text-xs ${tier.text} font-medium`}>
                    {tier.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {displayedCards.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No cards match your filters
          </div>
        )}

        {/* Card Detail Modal */}
        {selectedCard && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCard(null)}
          >
            <div 
              className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Card image */}
              <div className="aspect-square relative">
                {selectedCard.image ? (
                  <Image
                    src={selectedCard.image}
                    alt={selectedCard.name || `Token #${selectedCard.tokenId}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <span className="text-4xl">🎴</span>
                  </div>
                )}
                {/* Power badge */}
                <div className={`absolute top-4 right-4 px-4 py-2 rounded-xl bg-gradient-to-r ${getTier(selectedCard.power).color} text-white font-bold text-2xl shadow-lg`}>
                  {selectedCard.power}
                </div>
              </div>
              
              {/* Card details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    {selectedCard.name || `Token #${selectedCard.tokenId}`}
                  </h3>
                  <span className={`px-3 py-1 rounded-lg ${getTier(selectedCard.power).bg} ${getTier(selectedCard.power).text} font-bold`}>
                    {getTier(selectedCard.power).name}
                  </span>
                </div>
                
                <div className="text-gray-400 text-sm mb-4">
                  Token ID: #{selectedCard.tokenId}
                </div>
                
                {/* Traits */}
                {selectedCard.traits && selectedCard.traits.length > 0 && (
                  <div>
                    <h4 className="text-gray-300 font-semibold mb-2">Traits</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCard.traits.map((trait, idx) => (
                        <div key={idx} className="bg-gray-800 rounded-lg p-2">
                          <div className="text-gray-500 text-xs">{trait.trait_type}</div>
                          <div className="text-white text-sm font-medium truncate">{trait.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedCard(null)}
                  className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
