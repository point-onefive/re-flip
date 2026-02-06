"use client";

import { TraitPower, formatTraitName } from "@/lib/traitPowerData";

interface TraitBreakdownProps {
  traitPowers: TraitPower[];
  totalPower: number;
  gender: 'male' | 'female' | 'one-of-one';
  isWinner: boolean;
  compact?: boolean;
}

export function TraitBreakdown({
  traitPowers,
  totalPower,
  gender,
  isWinner,
  compact = false,
}: TraitBreakdownProps) {
  // Sort traits by power (highest first)
  const sortedTraits = [...traitPowers].sort((a, b) => b.power - a.power);

  const genderBadge = gender === 'one-of-one' 
    ? '🃏 1/1' 
    : gender === 'female' 
    ? '♀️ Female' 
    : '♂️ Male';

  const genderColor = gender === 'one-of-one'
    ? 'text-purple-400'
    : gender === 'female'
    ? 'text-pink-400'
    : 'text-blue-400';

  if (compact) {
    // Compact view for the battle result modal
    return (
      <div className={`text-xs ${isWinner ? 'text-green-200' : 'text-red-200'}`}>
        <div className={`font-semibold ${genderColor} mb-1`}>{genderBadge}</div>
        <div className="space-y-0.5 max-h-32 overflow-y-auto">
          {sortedTraits.map((trait, idx) => (
            <div key={idx} className="flex justify-between gap-2 opacity-80">
              <span className="truncate flex-1">{formatTraitName(trait.trait)}</span>
              <span className="font-mono text-yellow-300">+{trait.power}</span>
            </div>
          ))}
        </div>
        <div className={`border-t ${isWinner ? 'border-green-500' : 'border-red-500'} mt-1 pt-1 flex justify-between font-bold`}>
          <span>Total</span>
          <span className="font-mono text-lg">{totalPower}</span>
        </div>
      </div>
    );
  }

  // Full view for game detail page
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <span className={`font-semibold ${genderColor}`}>{genderBadge}</span>
        <span className={`text-2xl font-bold ${isWinner ? 'text-green-400' : 'text-gray-400'}`}>
          ⚡{totalPower}
        </span>
      </div>
      <div className="space-y-1">
        {sortedTraits.map((trait, idx) => (
          <div 
            key={idx} 
            className="flex justify-between items-center text-sm"
          >
            <div className="flex-1">
              <span className="text-gray-400">{formatTraitName(trait.trait)}:</span>
              <span className="text-white ml-1">{trait.value}</span>
            </div>
            <span className="font-mono text-yellow-400 ml-2">+{trait.power}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between items-center">
        <span className="text-gray-300 font-semibold">Total Power</span>
        <span className={`font-mono text-xl font-bold ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
          {totalPower}
        </span>
      </div>
    </div>
  );
}
