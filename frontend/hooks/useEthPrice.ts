"use client";

import { useState, useEffect } from "react";

interface PriceData {
  ethPrice: number | null;
  isLoading: boolean;
  error: string | null;
}

export function useEthPrice(): PriceData {
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Using CoinGecko's free API
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch price");
        }
        
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
        setError(null);
      } catch (err) {
        console.error("Error fetching ETH price:", err);
        setError("Failed to fetch price");
        // Fallback price if API fails
        setEthPrice(2500);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    
    // Refresh price every 60 seconds
    const interval = setInterval(fetchPrice, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return { ethPrice, isLoading, error };
}

// Helper function to format USD
export function formatUsd(ethAmount: number, ethPrice: number | null): string {
  if (ethPrice === null) return "";
  const usdValue = ethAmount * ethPrice;
  
  if (usdValue < 0.01) {
    return `~$${usdValue.toFixed(4)}`;
  } else if (usdValue < 1) {
    return `~$${usdValue.toFixed(2)}`;
  } else if (usdValue < 1000) {
    return `$${usdValue.toFixed(2)}`;
  } else {
    return `$${usdValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
}
