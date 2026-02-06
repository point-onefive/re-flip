#!/usr/bin/env npx ts-node

/**
 * Verify Deck Images
 * 
 * Validates that all images in a deck are cached locally and accessible.
 * Reports any missing or corrupted files.
 * 
 * Usage: npx ts-node scripts/verify-deck-images.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DECK_ID = 1;
const POWER_MAP_PATH = path.join(__dirname, "../frontend/public/data/decks/re_generates_power_map.json");
const METADATA_PATH = path.join(__dirname, "../frontend/public/data/decks/re_generates_metadata.json");
const IMAGES_DIR = path.join(__dirname, `../frontend/public/images/decks/${DECK_ID}`);

interface CachedMetadata {
  [tokenId: string]: {
    name: string;
    image: string;
    attributes: { trait_type: string; value: string }[];
  };
}

interface VerificationResult {
  tokenId: string;
  status: "ok" | "missing-metadata" | "missing-image" | "empty-image" | "invalid-path";
  details?: string;
}

function main() {
  console.log("🔍 Verifying Deck Images\n");
  
  // Load power map
  if (!fs.existsSync(POWER_MAP_PATH)) {
    console.error(`❌ Power map not found: ${POWER_MAP_PATH}`);
    process.exit(1);
  }
  
  const powerMap: Record<string, number> = JSON.parse(fs.readFileSync(POWER_MAP_PATH, "utf8"));
  const tokenIds = Object.keys(powerMap);
  
  console.log(`📦 Deck has ${tokenIds.length} tokens in power map`);
  
  // Load metadata
  if (!fs.existsSync(METADATA_PATH)) {
    console.error(`❌ Metadata not found: ${METADATA_PATH}`);
    console.log("   Run: npx ts-node scripts/cache-deck-images.ts");
    process.exit(1);
  }
  
  const metadata: CachedMetadata = JSON.parse(fs.readFileSync(METADATA_PATH, "utf8"));
  console.log(`📄 Metadata has ${Object.keys(metadata).length} entries`);
  
  // Check images directory
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }
  
  const imageFiles = fs.readdirSync(IMAGES_DIR);
  console.log(`🖼️  Images directory has ${imageFiles.length} files\n`);
  
  // Verify each token
  const results: VerificationResult[] = [];
  
  for (const tokenId of tokenIds) {
    const meta = metadata[tokenId];
    
    // Check metadata exists
    if (!meta) {
      results.push({ tokenId, status: "missing-metadata" });
      continue;
    }
    
    // Check image path is valid
    if (!meta.image || !meta.image.startsWith("/images/decks/")) {
      results.push({ tokenId, status: "invalid-path", details: meta.image });
      continue;
    }
    
    // Check image file exists
    const imagePath = path.join(__dirname, "../frontend/public", meta.image);
    if (!fs.existsSync(imagePath)) {
      results.push({ tokenId, status: "missing-image", details: meta.image });
      continue;
    }
    
    // Check image file is not empty
    const stats = fs.statSync(imagePath);
    if (stats.size < 100) {
      results.push({ tokenId, status: "empty-image", details: `${stats.size} bytes` });
      continue;
    }
    
    results.push({ tokenId, status: "ok" });
  }
  
  // Report results
  const ok = results.filter(r => r.status === "ok");
  const problems = results.filter(r => r.status !== "ok");
  
  console.log("=".repeat(50));
  console.log("📊 Verification Results:");
  console.log(`   ✅ OK: ${ok.length}/${tokenIds.length}`);
  
  if (problems.length === 0) {
    console.log("\n🎉 All tokens verified successfully!");
  } else {
    console.log(`   ❌ Problems: ${problems.length}`);
    console.log("\n❌ Problem Tokens:");
    
    for (const problem of problems) {
      console.log(`   Token ${problem.tokenId}: ${problem.status}${problem.details ? ` (${problem.details})` : ""}`);
    }
    
    console.log("\n💡 To fix, run: npx ts-node scripts/cache-deck-images.ts");
  }
  
  // Return exit code
  process.exit(problems.length > 0 ? 1 : 0);
}

main();
