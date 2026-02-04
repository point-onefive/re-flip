"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { baseSepolia, base } from "wagmi/chains";
import { config } from "@/lib/wagmi";
import { ReactNode, useState, useEffect } from "react";

const defaultChain = process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? base : baseSepolia;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering providers until client-side
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-950">
        {/* Minimal loading shell to prevent layout shift */}
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          chain={defaultChain}
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
