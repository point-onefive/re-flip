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
  Identity,
} from "@coinbase/onchainkit/identity";
import { useAccount, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  const { isConnected, chainId, address } = useAccount();
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

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!mounted) {
    return (
      <button className="h-10 bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors opacity-50">
        Connect
      </button>
    );
  }

  // Show warning if on wrong network
  const isWrongNetwork = isConnected && chainId !== baseSepolia.id;

  return (
    <div className="flex items-center gap-2">
      {isWrongNetwork && (
        <button
          onClick={() => switchChain?.({ chainId: baseSepolia.id })}
          className="h-10 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg transition-colors whitespace-nowrap"
        >
          <span className="hidden sm:inline">Switch Network</span>
          <span className="sm:hidden">Switch</span>
        </button>
      )}
      <Wallet>
        <ConnectWallet className="h-10 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2">
          {isConnected && address ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
              <span className="font-mono">{truncateAddress(address)}</span>
            </>
          ) : (
            <span>Connect</span>
          )}
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Address />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
