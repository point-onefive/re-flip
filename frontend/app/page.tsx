"use client";

import dynamic from "next/dynamic";

// Dynamically import with SSR disabled to prevent hydration errors
const HomeContent = dynamic(
  () => import("@/components/HomeContent").then((mod) => mod.HomeContent),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen">
        <header className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🪙</span>
              <span className="text-xl font-bold">Re-Flip</span>
            </div>
            <div className="bg-gray-800 text-white text-sm py-2 px-4 rounded-lg animate-pulse">
              Loading...
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Flip. Wager. Win.
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              The simplest onchain game. Create a game, invite a friend or find
              an opponent, and flip a coin. Winner takes all (minus 1% fee).
            </p>
          </div>
        </main>
      </div>
    ),
  }
);

export default function Home() {
  return <HomeContent />;
}
