/**
 * Collection Analyzer Script v2
 * 
 * Fetches all NFT metadata from re:generates collection, analyzes trait rarity
 * with proper handling of:
 * - Male vs Female characters (female traits have underscores)
 * - 1/1 NFTs (no traits) treated as trump cards with max power
 * 
 * Usage: npx tsx analyze-collection.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONFIG = {
  collectionName: 're:generates',
  collectionAddress: '0x56dFE6ae26bf3043DC8Fdf33bF739B4fF4B3BC4A',
  totalSupply: 6666,
  metadataBaseUrl: 'https://app.bueno.art/api/contract/JLK3PYMUlbiFqxCjWTj1F/chain/8453/metadata',
  deckSize: 6666, // All tokens
  batchSize: 50,
  delayBetweenBatches: 1000,
  outputDir: '../frontend/data/decks',
  
  // Power configuration
  oneOfOnePower: 999, // Trump card power for 1/1s
  maxTraitPower: 100, // Max power per trait for regular NFTs
};

// Types
interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface NFTMetadata {
  name: string;
  description?: string;
  image: string;
  attributes: NFTAttribute[];
}

interface TraitStats {
  traitType: string;
  value: string;
  count: number;
  rarity: number;
  powerPoints: number;
  gender: 'male' | 'female';
}

interface NFTWithPower {
  tokenId: number;
  name: string;
  image: string;
  attributes: NFTAttribute[];
  totalPower: number;
  gender: 'male' | 'female' | 'one-of-one';
  traitPowers: { trait: string; value: string; power: number }[];
}

interface DeckOutput {
  collection: {
    name: string;
    address: string;
    totalSupply: number;
    analyzedAt: string;
  };
  stats: {
    totalMales: number;
    totalFemales: number;
    totalOneOfOnes: number;
  };
  deckSize: number;
  powerRange: {
    min: number;
    max: number;
    average: number;
  };
  deck: NFTWithPower[];
}

// Utility functions
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<NFTMetadata | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) {
        return null;
      }
      await sleep(1000 * (i + 1));
    }
  }
  return null;
}

/**
 * Determine if an NFT is male, female, or a 1/1 based on traits
 * - 1/1s have an "artist" trait (18 unique artworks by guest artists)
 * - Female traits have underscores in trait_type (e.g., _eyes, _hair)
 * - Males have no underscores in trait types
 */
function classifyNFT(nft: NFTMetadata): 'male' | 'female' | 'one-of-one' {
  if (!nft.attributes || nft.attributes.length === 0) {
    return 'one-of-one';
  }
  
  // Check for "artist" trait - indicates a 1/1 artwork
  const hasArtistTrait = nft.attributes.some(attr => 
    attr.trait_type.toLowerCase() === 'artist'
  );
  if (hasArtistTrait) {
    return 'one-of-one';
  }
  
  // Check if any trait has an underscore (indicates female)
  const hasFemaleTraits = nft.attributes.some(attr => 
    attr.trait_type.includes('_')
  );
  
  return hasFemaleTraits ? 'female' : 'male';
}

// Step 1: Fetch all metadata
async function fetchAllMetadata(): Promise<Map<number, NFTMetadata>> {
  console.log(`\n📥 Fetching metadata for ${CONFIG.totalSupply} NFTs...`);
  
  const metadata = new Map<number, NFTMetadata>();
  const cacheFile = './cache/re_generates_metadata.json';
  
  // Check for cached data
  if (fs.existsSync(cacheFile)) {
    console.log(`  Found cached metadata, loading...`);
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    for (const [id, data] of Object.entries(cached)) {
      metadata.set(parseInt(id), data as NFTMetadata);
    }
    console.log(`  Loaded ${metadata.size} NFTs from cache`);
    return metadata;
  }
  
  const startTime = Date.now();
  let fetched = 0;
  let failed = 0;
  
  // Fetch in batches
  for (let i = 0; i < CONFIG.totalSupply; i += CONFIG.batchSize) {
    const batchPromises: Promise<void>[] = [];
    
    for (let j = i; j < Math.min(i + CONFIG.batchSize, CONFIG.totalSupply); j++) {
      const tokenId = j + 1; // Token IDs are 1-indexed
      batchPromises.push(
        fetchWithRetry(`${CONFIG.metadataBaseUrl}/${tokenId}`).then(data => {
          if (data) {
            metadata.set(tokenId, data);
            fetched++;
          } else {
            failed++;
          }
        })
      );
    }
    
    await Promise.all(batchPromises);
    
    // Progress update
    const progress = ((i + CONFIG.batchSize) / CONFIG.totalSupply * 100).toFixed(1);
    process.stdout.write(`\r  Progress: ${progress}% (${fetched} fetched, ${failed} failed)`);
    
    await sleep(CONFIG.delayBetweenBatches);
  }
  
  console.log(`\n  Fetched ${metadata.size} NFTs in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  
  // Cache the data
  fs.mkdirSync('./cache', { recursive: true });
  const cacheData: Record<string, NFTMetadata> = {};
  metadata.forEach((data, id) => { cacheData[id.toString()] = data; });
  fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
  console.log(`  Cached metadata to ${cacheFile}`);
  
  return metadata;
}

// Step 2: Analyze trait distribution BY GENDER
function analyzeTraitsByGender(metadata: Map<number, NFTMetadata>): {
  maleTraits: Map<string, Map<string, number>>;
  femaleTraits: Map<string, Map<string, number>>;
  maleCount: number;
  femaleCount: number;
  oneOfOneCount: number;
  oneOfOneIds: number[];
} {
  console.log(`\n📊 Analyzing trait distribution by gender...`);
  
  const maleTraits = new Map<string, Map<string, number>>();
  const femaleTraits = new Map<string, Map<string, number>>();
  const oneOfOneIds: number[] = [];
  
  let maleCount = 0;
  let femaleCount = 0;
  
  for (const [tokenId, nft] of metadata) {
    const gender = classifyNFT(nft);
    
    if (gender === 'one-of-one') {
      oneOfOneIds.push(tokenId);
      continue;
    }
    
    const traitMap = gender === 'male' ? maleTraits : femaleTraits;
    
    if (gender === 'male') maleCount++;
    else femaleCount++;
    
    for (const attr of nft.attributes) {
      if (!traitMap.has(attr.trait_type)) {
        traitMap.set(attr.trait_type, new Map());
      }
      const valueCounts = traitMap.get(attr.trait_type)!;
      valueCounts.set(attr.value, (valueCounts.get(attr.value) || 0) + 1);
    }
  }
  
  // Print summary
  console.log(`\n  Population breakdown:`);
  console.log(`    Males: ${maleCount}`);
  console.log(`    Females: ${femaleCount}`);
  console.log(`    1/1s (Trump Cards): ${oneOfOneIds.length}`);
  
  console.log(`\n  Male trait categories (${maleTraits.size}):`);
  for (const [traitType, values] of maleTraits) {
    const sortedValues = [...values.entries()].sort((a, b) => a[1] - b[1]);
    const rarest = sortedValues[0];
    const mostCommon = sortedValues[sortedValues.length - 1];
    console.log(`    ${traitType}: ${values.size} values (rarest: "${rarest[0]}" x${rarest[1]}, common: "${mostCommon[0]}" x${mostCommon[1]})`);
  }
  
  console.log(`\n  Female trait categories (${femaleTraits.size}):`);
  for (const [traitType, values] of femaleTraits) {
    const sortedValues = [...values.entries()].sort((a, b) => a[1] - b[1]);
    const rarest = sortedValues[0];
    const mostCommon = sortedValues[sortedValues.length - 1];
    console.log(`    ${traitType}: ${values.size} values (rarest: "${rarest[0]}" x${rarest[1]}, common: "${mostCommon[0]}" x${mostCommon[1]})`);
  }
  
  return { maleTraits, femaleTraits, maleCount, femaleCount, oneOfOneCount: oneOfOneIds.length, oneOfOneIds };
}

// Step 3: Calculate power levels with gender-specific rarity
function calculateTraitPower(count: number, genderPopulation: number): number {
  // Rarity within the gender category
  const rarity = genderPopulation / count;
  
  // Power formula: logarithmic scale
  // Common traits (50%+ of gender): ~1-10 power
  // Rare traits (1-10% of gender): ~10-30 power  
  // Ultra-rare (<1% of gender): ~30-60+ power
  const power = Math.round(Math.log2(rarity) * 10);
  return Math.max(1, Math.min(CONFIG.maxTraitPower, power));
}

function calculateAllPowerLevels(
  metadata: Map<number, NFTMetadata>,
  maleTraits: Map<string, Map<string, number>>,
  femaleTraits: Map<string, Map<string, number>>,
  maleCount: number,
  femaleCount: number,
  oneOfOneIds: number[]
): NFTWithPower[] {
  console.log(`\n⚡ Calculating power levels (gender-normalized)...`);
  
  const nftsWithPower: NFTWithPower[] = [];
  
  // Pre-calculate power for male traits (normalized to male population)
  const malePowerMap = new Map<string, Map<string, number>>();
  for (const [traitType, values] of maleTraits) {
    const powerMap = new Map<string, number>();
    for (const [value, count] of values) {
      powerMap.set(value, calculateTraitPower(count, maleCount));
    }
    malePowerMap.set(traitType, powerMap);
  }
  
  // Pre-calculate power for female traits (normalized to female population)
  const femalePowerMap = new Map<string, Map<string, number>>();
  for (const [traitType, values] of femaleTraits) {
    const powerMap = new Map<string, number>();
    for (const [value, count] of values) {
      powerMap.set(value, calculateTraitPower(count, femaleCount));
    }
    femalePowerMap.set(traitType, powerMap);
  }
  
  // Calculate power for each NFT
  for (const [tokenId, nft] of metadata) {
    const gender = classifyNFT(nft);
    
    // Handle 1/1s as trump cards
    if (gender === 'one-of-one') {
      nftsWithPower.push({
        tokenId,
        name: nft.name,
        image: nft.image,
        attributes: nft.attributes || [],
        totalPower: CONFIG.oneOfOnePower,
        gender: 'one-of-one',
        traitPowers: [{ trait: 'TRUMP_CARD', value: '1/1', power: CONFIG.oneOfOnePower }]
      });
      continue;
    }
    
    const powerMap = gender === 'male' ? malePowerMap : femalePowerMap;
    const traitPowers: { trait: string; value: string; power: number }[] = [];
    let totalPower = 0;
    
    for (const attr of nft.attributes) {
      const traitPower = powerMap.get(attr.trait_type)?.get(attr.value) || 0;
      traitPowers.push({
        trait: attr.trait_type,
        value: attr.value,
        power: traitPower
      });
      totalPower += traitPower;
    }
    
    nftsWithPower.push({
      tokenId,
      name: nft.name,
      image: nft.image,
      attributes: nft.attributes,
      totalPower,
      gender,
      traitPowers
    });
  }
  
  // Sort by power
  nftsWithPower.sort((a, b) => b.totalPower - a.totalPower);
  
  // Print power distribution
  const powers = nftsWithPower.map(n => n.totalPower);
  const regularPowers = powers.filter(p => p < CONFIG.oneOfOnePower);
  
  console.log(`\n  Power distribution (excluding 1/1s):`);
  console.log(`    Min: ${Math.min(...regularPowers)}`);
  console.log(`    Max: ${Math.max(...regularPowers)}`);
  console.log(`    Avg: ${(regularPowers.reduce((a, b) => a + b, 0) / regularPowers.length).toFixed(1)}`);
  console.log(`\n  1/1 Trump Cards: ${oneOfOneIds.length} @ power ${CONFIG.oneOfOnePower}`);
  
  // Show top 10
  console.log(`\n  Top 10 most powerful:`);
  for (let i = 0; i < Math.min(10, nftsWithPower.length); i++) {
    const nft = nftsWithPower[i];
    console.log(`    ${i + 1}. #${nft.tokenId} (${nft.gender}): ${nft.totalPower} power - ${nft.name}`);
  }
  
  return nftsWithPower;
}

// Step 4: Select balanced deck with 1/1s, males, and females
function selectBalancedDeck(
  nftsWithPower: NFTWithPower[],
  maleCount: number,
  femaleCount: number,
  oneOfOneCount: number
): NFTWithPower[] {
  console.log(`\n🎴 Selecting balanced deck of ${CONFIG.deckSize} cards...`);
  
  const oneOfOnes = nftsWithPower.filter(n => n.gender === 'one-of-one');
  const males = nftsWithPower.filter(n => n.gender === 'male');
  const females = nftsWithPower.filter(n => n.gender === 'female');
  
  // Calculate proportional representation
  const totalPopulation = maleCount + femaleCount;
  const maleRatio = maleCount / totalPopulation;
  const femaleRatio = femaleCount / totalPopulation;
  
  // Reserve spots for 1/1s (all of them if we have less than ~10% of deck)
  const oneOfOneSlots = Math.min(oneOfOnes.length, Math.ceil(CONFIG.deckSize * 0.05)); // 5% for 1/1s
  const remainingSlots = CONFIG.deckSize - oneOfOneSlots;
  
  // Distribute remaining slots proportionally
  const maleSlots = Math.round(remainingSlots * maleRatio);
  const femaleSlots = remainingSlots - maleSlots;
  
  console.log(`\n  Deck composition:`);
  console.log(`    1/1 Trump Cards: ${oneOfOneSlots} (5% reserved)`);
  console.log(`    Males: ${maleSlots} (${(maleRatio * 100).toFixed(1)}% of regular)`);
  console.log(`    Females: ${femaleSlots} (${(femaleRatio * 100).toFixed(1)}% of regular)`);
  
  const deck: NFTWithPower[] = [];
  
  // Add 1/1s (all available up to limit)
  deck.push(...oneOfOnes.slice(0, oneOfOneSlots));
  
  // For males and females, select a spread across power levels (not just top)
  function selectSpread(nfts: NFTWithPower[], count: number): NFTWithPower[] {
    if (nfts.length <= count) return nfts;
    
    // Sort by power
    const sorted = [...nfts].sort((a, b) => b.totalPower - a.totalPower);
    
    // Take from different tiers: 15% legendary, 25% rare, 40% common, 20% basic
    const legendary = Math.ceil(count * 0.15);
    const rare = Math.ceil(count * 0.25);
    const common = Math.ceil(count * 0.40);
    const basic = count - legendary - rare - common;
    
    const result: NFTWithPower[] = [];
    const used = new Set<number>();
    
    // Legendary: top 10%
    const legendaryPool = sorted.slice(0, Math.floor(sorted.length * 0.10));
    for (let i = 0; i < legendary && legendaryPool.length > 0; i++) {
      const idx = Math.floor(Math.random() * legendaryPool.length);
      if (!used.has(legendaryPool[idx].tokenId)) {
        result.push(legendaryPool[idx]);
        used.add(legendaryPool[idx].tokenId);
      }
    }
    
    // Rare: 10-30%
    const rarePool = sorted.slice(Math.floor(sorted.length * 0.10), Math.floor(sorted.length * 0.30));
    for (let i = 0; i < rare && rarePool.length > 0; i++) {
      const idx = Math.floor(Math.random() * rarePool.length);
      if (!used.has(rarePool[idx].tokenId)) {
        result.push(rarePool[idx]);
        used.add(rarePool[idx].tokenId);
      }
    }
    
    // Common: 30-70%
    const commonPool = sorted.slice(Math.floor(sorted.length * 0.30), Math.floor(sorted.length * 0.70));
    for (let i = 0; i < common && commonPool.length > 0; i++) {
      const idx = Math.floor(Math.random() * commonPool.length);
      if (!used.has(commonPool[idx].tokenId)) {
        result.push(commonPool[idx]);
        used.add(commonPool[idx].tokenId);
      }
    }
    
    // Basic: bottom 30%
    const basicPool = sorted.slice(Math.floor(sorted.length * 0.70));
    for (let i = 0; i < basic && basicPool.length > 0; i++) {
      const idx = Math.floor(Math.random() * basicPool.length);
      if (!used.has(basicPool[idx].tokenId)) {
        result.push(basicPool[idx]);
        used.add(basicPool[idx].tokenId);
      }
    }
    
    // Fill remaining slots if needed
    while (result.length < count) {
      const idx = Math.floor(Math.random() * sorted.length);
      if (!used.has(sorted[idx].tokenId)) {
        result.push(sorted[idx]);
        used.add(sorted[idx].tokenId);
      }
    }
    
    return result;
  }
  
  deck.push(...selectSpread(males, maleSlots));
  deck.push(...selectSpread(females, femaleSlots));
  
  // Sort deck by power for display
  deck.sort((a, b) => b.totalPower - a.totalPower);
  
  // Print deck summary
  const regularDeck = deck.filter(n => n.gender !== 'one-of-one');
  const deckPowers = regularDeck.map(n => n.totalPower);
  
  console.log(`\n  Final deck stats:`);
  console.log(`    Total cards: ${deck.length}`);
  console.log(`    1/1s included: ${deck.filter(n => n.gender === 'one-of-one').length}`);
  console.log(`    Males included: ${deck.filter(n => n.gender === 'male').length}`);
  console.log(`    Females included: ${deck.filter(n => n.gender === 'female').length}`);
  console.log(`    Regular power range: ${Math.min(...deckPowers)} - ${Math.max(...deckPowers)}`);
  console.log(`    Regular power avg: ${(deckPowers.reduce((a, b) => a + b, 0) / deckPowers.length).toFixed(1)}`);
  
  return deck;
}

// Step 5: Save outputs
function saveOutputs(
  deck: NFTWithPower[],
  maleCount: number,
  femaleCount: number,
  oneOfOneCount: number
): void {
  console.log(`\n💾 Saving outputs...`);
  
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  
  // Full deck with metadata
  const regularDeck = deck.filter(n => n.gender !== 'one-of-one');
  const deckPowers = regularDeck.map(n => n.totalPower);
  
  const fullOutput: DeckOutput = {
    collection: {
      name: CONFIG.collectionName,
      address: CONFIG.collectionAddress,
      totalSupply: CONFIG.totalSupply,
      analyzedAt: new Date().toISOString(),
    },
    stats: {
      totalMales: maleCount,
      totalFemales: femaleCount,
      totalOneOfOnes: oneOfOneCount,
    },
    deckSize: deck.length,
    powerRange: {
      min: Math.min(...deckPowers),
      max: Math.max(...deckPowers),
      average: Math.round(deckPowers.reduce((a, b) => a + b, 0) / deckPowers.length),
    },
    deck,
  };
  
  const fullPath = path.join(CONFIG.outputDir, 're_generates.json');
  fs.writeFileSync(fullPath, JSON.stringify(fullOutput, null, 2));
  console.log(`  Full deck: ${fullPath}`);
  
  // Power map for contract (tokenId -> power)
  const powerMap: Record<number, number> = {};
  for (const nft of deck) {
    powerMap[nft.tokenId] = nft.totalPower;
  }
  
  const mapPath = path.join(CONFIG.outputDir, 're_generates_power_map.json');
  fs.writeFileSync(mapPath, JSON.stringify(powerMap, null, 2));
  console.log(`  Power map: ${mapPath}`);
}

// Main
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  re:generates Collection Analyzer v2');
  console.log('  Gender-Normalized Rarity + 1/1 Trump Cards');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Step 1: Fetch metadata
  const metadata = await fetchAllMetadata();
  
  // Step 2: Analyze traits by gender
  const { maleTraits, femaleTraits, maleCount, femaleCount, oneOfOneCount, oneOfOneIds } = 
    analyzeTraitsByGender(metadata);
  
  // Step 3: Calculate power levels
  const nftsWithPower = calculateAllPowerLevels(
    metadata, maleTraits, femaleTraits, maleCount, femaleCount, oneOfOneIds
  );
  
  // Step 4: Select balanced deck
  const deck = selectBalancedDeck(nftsWithPower, maleCount, femaleCount, oneOfOneCount);
  
  // Step 5: Save outputs
  saveOutputs(deck, maleCount, femaleCount, oneOfOneCount);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Done! Ready to upload deck to contract.');
  console.log('  Run: npm run upload-deck');
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch(console.error);
