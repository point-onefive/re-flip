"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";

const targetChain = process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? base : baseSepolia;

interface NetworkGuardProps {
  children: React.ReactNode;
}

export function NetworkGuard({ children }: NetworkGuardProps) {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId && chainId !== targetChain.id;

  if (!isWrongNetwork) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {/* Wrong Network Overlay */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Wrong Network</h2>
          <p className="text-gray-400 mb-6">
            re:match runs on <span className="text-purple-400 font-semibold">{targetChain.name}</span>.
            <br />
            Please switch networks to continue.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => switchChain?.({ chainId: targetChain.id })}
              disabled={isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-wait text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Switching...
                </span>
              ) : (
                `Switch to ${targetChain.name}`
              )}
            </button>
            <p className="text-gray-500 text-sm">
              Current network: <span className="text-gray-400">{chainId}</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Hook to check if user is on correct network
 */
export function useNetworkStatus() {
  const { isConnected, chainId } = useAccount();
  const isCorrectNetwork = !isConnected || (chainId === targetChain.id);
  const isWrongNetwork = isConnected && chainId !== targetChain.id;
  
  return {
    isCorrectNetwork,
    isWrongNetwork,
    targetChain,
    currentChainId: chainId,
  };
}
