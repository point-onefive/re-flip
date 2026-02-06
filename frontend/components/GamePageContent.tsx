"use client";

import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/WalletConnect";
import { GamePlay } from "@/components/GamePlay";
import Link from "next/link";

interface GamePageContentProps {
  gameId: string;
}

export function GamePageContent({ gameId }: GamePageContentProps) {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 bg-gray-950 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="text-2xl sm:text-3xl">🪙</span>
            <span className="text-lg sm:text-xl font-bold">re:match</span>
          </Link>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {!isConnected ? (
          <div className="text-center py-12">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              You need to connect your wallet to view or join this game.
            </p>
          </div>
        ) : (
          <GamePlay gameId={gameId} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8 sm:mt-12">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 text-center text-gray-500 text-xs sm:text-sm">
          <p>Built on Base • Powered by Coinbase</p>
        </div>
      </footer>
    </div>
  );
}
