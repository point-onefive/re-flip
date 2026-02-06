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
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Back to Lobby
          </Link>
        </div>
        <BattleGamePlay gameId={id} />
      </div>
    </main>
  );
}
