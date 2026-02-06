#!/usr/bin/env npx ts-node

/**
 * Cache Deck Images Locally
 * 
 * Downloads all NFT images for a deck and saves them locally.
 * This eliminates dependency on external APIs and improves load times.
 * 
 * Usage: npx ts-node scripts/cache-deck-images.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DECK_ID = 1;
const COLLECTION_NAME = "re_generates";
const POWER_MAP_PATH = path.join(__dirname, "../frontend/public/data/decks/re_generates_power_map.json");
const OUTPUT_DIR = path.join(__dirname, `../frontend/public/images/decks/${DECK_ID}`);
const METADATA_OUTPUT = path.join(__dirname, `../frontend/public/data/decks/${COLLECTION_NAME}_metadata.json`);

// Bueno API for metadata
const getTokenURI = (tokenId: number) => 
  `https://app.bueno.art/api/contract/JLK3PYMUlbiFqxCjWTj1F/chain/8453/metadata/${tokenId}`;

interface TokenMetadata {
  name: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
}

interface CachedMetadata {
  [tokenId: string]: {
    name: string;
    image: string; // local path
    attributes: { trait_type: string; value: string }[];
  };
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith("https") ? https : http;
    
    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(destPath);
          downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });
    
    request.on("error", (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error("Timeout"));
    });
  });
}

async function fetchMetadata(tokenId: number): Promise<TokenMetadata | null> {
  const url = getTokenURI(tokenId);
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
}

function getImageExtension(url: string): string {
  if (url.includes(".png")) return ".png";
  if (url.includes(".jpg") || url.includes(".jpeg")) return ".jpg";
  if (url.includes(".gif")) return ".gif";
  if (url.includes(".webp")) return ".webp";
  if (url.includes(".svg")) return ".svg";
  return ".png"; // default
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🎴 Caching Deck Images\n");
  
  // Load power map
  if (!fs.existsSync(POWER_MAP_PATH)) {
    console.error(`❌ Power map not found: ${POWER_MAP_PATH}`);
    process.exit(1);
  }
  
  const powerMap: Record<string, number> = JSON.parse(fs.readFileSync(POWER_MAP_PATH, "utf8"));
  const tokenIds = Object.keys(powerMap).map(Number);
  
  console.log(`📦 Found ${tokenIds.length} tokens in power map`);
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Load existing metadata cache if it exists
  let cachedMetadata: CachedMetadata = {};
  if (fs.existsSync(METADATA_OUTPUT)) {
    cachedMetadata = JSON.parse(fs.readFileSync(METADATA_OUTPUT, "utf8"));
    console.log(`📂 Loaded ${Object.keys(cachedMetadata).length} cached entries`);
  }
  
  // Process each token
  let success = 0;
  let skipped = 0;
  let failed = 0;
  
  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i];
    const progress = `[${i + 1}/${tokenIds.length}]`;
    
    // Check if already cached
    const existingFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith(`${tokenId}.`));
    if (existingFiles.length > 0 && cachedMetadata[tokenId]) {
      skipped++;
      process.stdout.write(`${progress} Token ${tokenId}: ⏭️  Cached\r`);
      continue;
    }
    
    process.stdout.write(`${progress} Token ${tokenId}: Fetching metadata...   \r`);
    
    // Fetch metadata
    const metadata = await fetchMetadata(tokenId);
    if (!metadata || !metadata.image) {
      console.log(`${progress} Token ${tokenId}: ❌ No metadata`);
      failed++;
      continue;
    }
    
    // Download image
    const ext = getImageExtension(metadata.image);
    const imagePath = path.join(OUTPUT_DIR, `${tokenId}${ext}`);
    
    process.stdout.write(`${progress} Token ${tokenId}: Downloading image...   \r`);
    
    try {
      await downloadFile(metadata.image, imagePath);
      
      // Save to metadata cache
      cachedMetadata[tokenId] = {
        name: metadata.name,
        image: `/images/decks/${DECK_ID}/${tokenId}${ext}`,
        attributes: metadata.attributes || [],
      };
      
      success++;
      console.log(`${progress} Token ${tokenId}: ✅ ${metadata.name}`);
    } catch (err) {
      console.log(`${progress} Token ${tokenId}: ❌ Download failed - ${err}`);
      failed++;
    }
    
    // Rate limit to avoid hammering the API
    await sleep(100);
    
    // Save metadata periodically
    if (i % 20 === 0) {
      fs.writeFileSync(METADATA_OUTPUT, JSON.stringify(cachedMetadata, null, 2));
    }
  }
  
  // Save final metadata
  fs.writeFileSync(METADATA_OUTPUT, JSON.stringify(cachedMetadata, null, 2));
  
  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log(`   ✅ Downloaded: ${success}`);
  console.log(`   ⏭️  Skipped (cached): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`\n📁 Images saved to: ${OUTPUT_DIR}`);
  console.log(`📄 Metadata saved to: ${METADATA_OUTPUT}`);
}

main().catch(console.error);
