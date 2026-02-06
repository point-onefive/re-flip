"use client";

import dynamic from "next/dynamic";

// Dynamically import with SSR disabled to prevent hydration errors
const FlipLobby = dynamic(
  () => import("@/components/HomeContent").then((mod) => mod.HomeContent),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-950">
        <header className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🪙</span>
              <span className="text-xl font-bold">re:flip</span>
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

export default function FlipPage() {
  return <FlipLobby />;
}
