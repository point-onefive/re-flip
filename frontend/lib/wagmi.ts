"use client";

import { http, createConfig } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

// Default to Base Sepolia for development
const defaultChain = process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? base : baseSepolia;

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "Re-Flip",
      preference: "smartWalletOnly",
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo",
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
});

export { defaultChain };
