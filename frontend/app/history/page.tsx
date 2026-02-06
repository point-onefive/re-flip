"use client";

import dynamic from "next/dynamic";

// Dynamically import with SSR disabled to prevent hydration errors
const GameHistoryContent = dynamic(
  () => import("@/components/GameHistoryContent").then((mod) => mod.GameHistoryContent),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-950">
        <header className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/assets/regen_226.png" alt="re:match" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold">re:match</span>
            </div>
            <div className="bg-gray-800 text-white text-sm py-2 px-4 rounded-lg animate-pulse">
              Loading...
            </div>
          </div>
        </header>
      </div>
    ),
  }
);

export default function HistoryPage() {
  return <GameHistoryContent />;
}
