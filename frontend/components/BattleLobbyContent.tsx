"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/WalletConnect";
import { CreateBattleModal } from "@/components/CreateBattleModal";
import { BattleList } from "@/components/BattleList";
import Link from "next/link";

export function BattleLobbyContent() {
  const { address, isConnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "my-games">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleGameCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 bg-gray-950 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="text-2xl sm:text-3xl">⚔️</span>
            <span className="text-lg sm:text-xl font-bold">re:battle</span>
          </Link>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Draw. Battle. Win.
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Draw random NFTs from a collection. Higher token ID wins the pot (minus 1% fee).
          </p>

          {isConnected ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors"
            >
              Create New Battle
            </button>
          ) : (
            <div className="text-gray-400">
              Connect your wallet to start playing
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-white">1%</div>
            <div className="text-gray-400 text-xs sm:text-sm">Platform Fee</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-white">~$0.01</div>
            <div className="text-gray-400 text-xs sm:text-sm">Avg. Gas Cost</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-white">Base</div>
            <div className="text-gray-400 text-xs sm:text-sm">Network</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === "all"
                ? "text-purple-500 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Open Battles
          </button>
          <button
            onClick={() => setActiveTab("my-games")}
            disabled={!isConnected}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === "my-games"
                ? "text-purple-500 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
            }`}
          >
            My Battles
          </button>
        </div>

        {/* Battle List */}
        <BattleList
          currentAddress={address}
          filter={activeTab}
          onRefresh={refreshKey}
        />
      </main>

      {/* Create Battle Modal */}
      <CreateBattleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGameCreated={handleGameCreated}
      />

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>Built on Base • Powered by Coinbase</p>
          <p className="mt-1">
            <a
              href="https://basescan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-500 hover:underline"
            >
              View Contract on Basescan
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
