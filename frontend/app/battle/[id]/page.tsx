"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// V2 uses the new contract with VRF and epochs
const useV2 = process.env.NEXT_PUBLIC_USE_V2 === "true";

// Dynamically import with SSR disabled
const BattleGamePlay = dynamic(
  () => useV2 
    ? import("@/components/BattleGamePlayV2").then((mod) => mod.BattleGamePlayV2)
    : import("@/components/BattleGamePlay").then((mod) => mod.BattleGamePlay),
  { ssr: false }
);

export default function BattleGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
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

      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <BattleGamePlay gameId={id} />
      </div>
    </main>
  );
}
