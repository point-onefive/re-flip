"use client";

import { useState, useEffect } from "react";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Address,
  Avatar,
  Name,
  Identity,
} from "@coinbase/onchainkit/identity";
import { useAccount, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-switch to Base Sepolia if on wrong network
  useEffect(() => {
    if (isConnected && chainId && chainId !== baseSepolia.id) {
      switchChain?.({ chainId: baseSepolia.id });
    }
  }, [isConnected, chainId, switchChain]);

  if (!mounted) {
    return (
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors opacity-50">
        Connect Wallet
      </button>
    );
  }

  // Show warning if on wrong network
  const isWrongNetwork = isConnected && chainId !== baseSepolia.id;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {isWrongNetwork && (
        <button
          onClick={() => switchChain?.({ chainId: baseSepolia.id })}
          className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-colors whitespace-nowrap"
        >
          <span className="hidden sm:inline">Switch to Base Sepolia</span>
          <span className="sm:hidden">Wrong Network</span>
        </button>
      )}
      <Wallet>
        <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base">
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
