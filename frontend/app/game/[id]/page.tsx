"use client";

import { use } from "react";
import dynamic from "next/dynamic";

// Dynamically import with SSR disabled to prevent hydration errors
const GamePageContent = dynamic(
  () =>
    import("@/components/GamePageContent").then((mod) => mod.GamePageContent),
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
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading game...</p>
          </div>
        </main>
      </div>
    ),
  }
);

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export default function GamePage({ params }: GamePageProps) {
  const { id } = use(params);

  return <GamePageContent gameId={id} />;
}
