"use client";

import { useState, useEffect } from "react";
import { KNOWN_COLLECTIONS, NFTMetadata } from "@/lib/nftBattleContract";

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
        // Check if we have a known collection pattern
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

      const collection = KNOWN_COLLECTIONS[collectionAddress];
      if (!collection) {
        setIsLoading(false);
        return;
      }

      await Promise.all(
        tokenIds.filter(id => id > 0).map(async (tokenId) => {
          try {
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
