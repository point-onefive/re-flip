"use client";

import { useState, useEffect } from "react";
import { KNOWN_COLLECTIONS, NFTMetadata } from "@/lib/nftBattleContract";

// Deck ID mapping for collections
const COLLECTION_TO_DECK: Record<string, number> = {
  "0x56dFE6ae26bf3043DC8Fdf33bF739B4fF4B3BC4A": 1, // re:generates
};

// Cache for metadata files (loaded once per deck)
const metadataCache: Record<number, Record<string, { name: string; image: string; attributes: { trait_type: string; value: string }[] }>> = {};

interface UseNFTImageResult {
  imageUrl: string | null;
  metadata: NFTMetadata | null;
  isLoading: boolean;
  error: string | null;
}

export function useNFTImage(
  collectionAddress: string | undefined,
  tokenId: number | undefined
): UseNFTImageResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionAddress || !tokenId || tokenId === 0) {
      setImageUrl(null);
      setMetadata(null);
      return;
    }

    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if this collection has a local deck cache
        const deckId = COLLECTION_TO_DECK[collectionAddress];
        
        if (deckId) {
          // Try to use local cached metadata first
          if (!metadataCache[deckId]) {
            // Load the metadata cache for this deck
            try {
              const res = await fetch(`/data/decks/re_generates_metadata.json`);
              if (res.ok) {
                metadataCache[deckId] = await res.json();
              }
            } catch {
              // Metadata cache not available, will fall back to API
            }
          }
          
          // Check if we have this token cached
          const cached = metadataCache[deckId]?.[tokenId.toString()];
          if (cached) {
            setMetadata({
              name: cached.name,
              description: "",
              image: cached.image,
              attributes: cached.attributes,
            });
            setImageUrl(cached.image);
            setIsLoading(false);
            return;
          }
        }
        
        // Fallback to external API (for tokens not in deck or cache miss)
        const collection = KNOWN_COLLECTIONS[collectionAddress];
        
        if (!collection) {
          throw new Error("Unknown collection");
        }

        const metadataUrl = collection.getTokenURI(tokenId);
        const response = await fetch(metadataUrl);
        
        if (!response.ok) {
          throw new Error("Failed to fetch metadata");
        }

        const data: NFTMetadata = await response.json();
        setMetadata(data);
        setImageUrl(data.image);
      } catch (err) {
        console.error("Error fetching NFT metadata:", err);
        setError(err instanceof Error ? err.message : "Failed to load NFT");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [collectionAddress, tokenId]);

  return { imageUrl, metadata, isLoading, error };
}

// Preload multiple NFT images
export function useNFTImages(
  collectionAddress: string | undefined,
  tokenIds: number[]
): {
  images: Map<number, { url: string | null; metadata: NFTMetadata | null }>;
  isLoading: boolean;
  allLoaded: boolean;
} {
  const [images, setImages] = useState<Map<number, { url: string | null; metadata: NFTMetadata | null }>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    if (!collectionAddress || tokenIds.length === 0 || tokenIds.every(id => id === 0)) {
      return;
    }

    const fetchAll = async () => {
      setIsLoading(true);
      const newImages = new Map<number, { url: string | null; metadata: NFTMetadata | null }>();

      // Check if this collection has a local deck cache
      const deckId = COLLECTION_TO_DECK[collectionAddress];
      
      if (deckId) {
        // Load the metadata cache for this deck if not already loaded
        if (!metadataCache[deckId]) {
          try {
            const res = await fetch(`/data/decks/re_generates_metadata.json`);
            if (res.ok) {
              metadataCache[deckId] = await res.json();
            }
          } catch {
            // Cache not available
          }
        }
      }

      const collection = KNOWN_COLLECTIONS[collectionAddress];
      
      await Promise.all(
        tokenIds.filter(id => id > 0).map(async (tokenId) => {
          try {
            // Try local cache first
            if (deckId && metadataCache[deckId]) {
              const cached = metadataCache[deckId][tokenId.toString()];
              if (cached) {
                newImages.set(tokenId, { 
                  url: cached.image, 
                  metadata: { name: cached.name, description: "", image: cached.image, attributes: cached.attributes } 
                });
                return;
              }
            }
            
            // Fallback to API
            if (!collection) {
              newImages.set(tokenId, { url: null, metadata: null });
              return;
            }
            
            const metadataUrl = collection.getTokenURI(tokenId);
            const response = await fetch(metadataUrl);
            const data: NFTMetadata = await response.json();
            newImages.set(tokenId, { url: data.image, metadata: data });
          } catch {
            newImages.set(tokenId, { url: null, metadata: null });
          }
        })
      );

      setImages(newImages);
      setIsLoading(false);
      setAllLoaded(true);
    };

    fetchAll();
  }, [collectionAddress, tokenIds.join(",")]);

  return { images, isLoading, allLoaded };
}
