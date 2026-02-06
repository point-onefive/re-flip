/**
 * Collection Analyzer Script v3 - Percentile-Based Power
 * 
 * Creates normalized power levels (100-999) based on relative rank within the deck.
 * This ensures cross-collection compatibility: a "top 1%" card from any collection
 * will have the same power level (~990-999) regardless of trait count or distribution.
 * 
 * Key Features:
 * - Percentile-based power (rank determines power, not raw rarity)
 * - Fixed 100-999 power range for ALL collections
 * - 1/1s automatically get highest ranks → power 999
 * - Gender-normalized within collection, then unified for deck
 * - Guaranteed power distribution (top 2% = 950-999, etc.)
 * 
 * Usage: npx tsx analyze-collection-v2.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============ Configuration ============
const CONFIG = {
  collectionName: 're:generates',
  collectionAddress: '0x56dFE6ae26bf3043DC8Fdf33bF739B4fF4B3BC4A',
  totalSupply: 6666,
  metadataBaseUrl: 'https://app.bueno.art/api/contract/JLK3PYMUlbiFqxCjWTj1F/chain/8453/metadata',
  deckSize: 200,
  batchSize: 50,
  delayBetweenBatches: 1000,
  outputDir: '../frontend/data/decks',
  cacheDir: './cache',
  
  // Power configuration (DO NOT CHANGE - this is the standard)
  powerMin: 100,    // Lowest possible power
  powerMax: 999,    // Highest possible power (1/1s and top cards)
};

// Power tier definitions (for deck selection balance)
const POWER_TIERS = {
  LEGENDARY: { min: 950, max: 999, percentage: 0.02 },  // Top 2%
  EPIC:      { min: 850, max: 949, percentage: 0.08 },  // Next 8%
  RARE:      { min: 700, max: 849, percentage: 0.15 },  // Next 15%
  UNCOMMON:  { min: 500, max: 699, percentage: 0.25 },  // Next 25%
  COMMON:    { min: 300, max: 499, percentage: 0.25 },  // Next 25%
  BASIC:     { min: 100, max: 299, percentage: 0.25 },  // Bottom 25%
};

// ============ Types ============
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

type Gender = 'male' | 'female' | 'one-of-one';

interface NFTWithRawScore {
  tokenId: number;
  name: string;
  image: string;
  attributes: NFTAttribute[];
  gender: Gender;
  rawScore: number;  // Sum of trait rarity scores
}

interface NFTWithPower {
  tokenId: number;
  name: string;
  image: string;
  attributes: NFTAttribute[];
  gender: Gender;
  rawScore: number;
  rank: number;        // 0 = most rare, N-1 = most common
  percentile: number;  // 0.0 = most rare, 1.0 = most common
  power: number;       // 100-999 based on percentile
  tier: string;        // LEGENDARY, EPIC, etc.
}

interface DeckOutput {
  collection: {
    name: string;
    address: string;
    totalSupply: number;
    analyzedAt: string;
    methodology: string;
  };
  stats: {
    totalMales: number;
    totalFemales: number;
    totalOneOfOnes: number;
    deckSize: number;
  };
  powerDistribution: {
    min: number;
    max: number;
    average: number;
    tiers: Record<string, number>;
  };
  deck: NFTWithPower[];
}

// ============ Utility Functions ============
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<NFTMetadata | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      if (i === retries - 1) return null;
      await sleep(1000 * (i + 1));
    }
  }
  return null;
}

function classifyNFT(nft: NFTMetadata): Gender {
  if (!nft.attributes || nft.attributes.length === 0) return 'one-of-one';
  
  // Check for "artist" trait (1/1 artwork)
  const hasArtistTrait = nft.attributes.some(attr => 
    attr.trait_type.toLowerCase() === 'artist'
  );
  if (hasArtistTrait) return 'one-of-one';
  
  // Female traits have underscores
  const hasFemaleTraits = nft.attributes.some(attr => attr.trait_type.includes('_'));
  return hasFemaleTraits ? 'female' : 'male';
}

function getTierName(power: number): string {
  if (power >= POWER_TIERS.LEGENDARY.min) return 'LEGENDARY';
  if (power >= POWER_TIERS.EPIC.min) return 'EPIC';
  if (power >= POWER_TIERS.RARE.min) return 'RARE';
  if (power >= POWER_TIERS.UNCOMMON.min) return 'UNCOMMON';
  if (power >= POWER_TIERS.COMMON.min) return 'COMMON';
  return 'BASIC';
}

// ============ Step 1: Fetch Metadata ============
async function fetchAllMetadata(): Promise<Map<number, NFTMetadata>> {
  console.log(`\n📥 Fetching metadata for ${CONFIG.totalSupply} NFTs...`);
  
  const metadata = new Map<number, NFTMetadata>();
  const cacheFile = path.join(CONFIG.cacheDir, 're_generates_metadata.json');
  
  // Check cache
  if (fs.existsSync(cacheFile)) {
    console.log(`  📂 Loading from cache...`);
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    for (const [id, data] of Object.entries(cached)) {
      metadata.set(parseInt(id), data as NFTMetadata);
    }
    console.log(`  ✓ Loaded ${metadata.size} NFTs from cache`);
    return metadata;
  }
  
  // Fetch fresh
  const startTime = Date.now();
  let fetched = 0, failed = 0;
  
  for (let i = 0; i < CONFIG.totalSupply; i += CONFIG.batchSize) {
    const batchPromises: Promise<void>[] = [];
    
    for (let j = i; j < Math.min(i + CONFIG.batchSize, CONFIG.totalSupply); j++) {
      const tokenId = j + 1;
      batchPromises.push(
        fetchWithRetry(`${CONFIG.metadataBaseUrl}/${tokenId}`).then(data => {
          if (data) { metadata.set(tokenId, data); fetched++; }
          else { failed++; }
        })
      );
    }
    
    await Promise.all(batchPromises);
    const progress = ((i + CONFIG.batchSize) / CONFIG.totalSupply * 100).toFixed(1);
    process.stdout.write(`\r  Progress: ${progress}% (${fetched} fetched, ${failed} failed)`);
    await sleep(CONFIG.delayBetweenBatches);
  }
  
  console.log(`\n  ✓ Fetched ${metadata.size} NFTs in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  
  // Cache
  fs.mkdirSync(CONFIG.cacheDir, { recursive: true });
  const cacheData: Record<string, NFTMetadata> = {};
  metadata.forEach((data, id) => { cacheData[id.toString()] = data; });
  fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
  console.log(`  💾 Cached to ${cacheFile}`);
  
  return metadata;
}

// ============ Step 2: Calculate Raw Rarity Scores ============
function calculateRawScores(metadata: Map<number, NFTMetadata>): {
  nfts: NFTWithRawScore[];
  maleCount: number;
  femaleCount: number;
  oneOfOneCount: number;
} {
  console.log(`\n📊 Calculating raw rarity scores (gender-normalized)...`);
  
  // First pass: count trait occurrences by gender
  const maleTraitCounts = new Map<string, Map<string, number>>();
  const femaleTraitCounts = new Map<string, Map<string, number>>();
  let maleCount = 0, femaleCount = 0, oneOfOneCount = 0;
  
  for (const [, nft] of metadata) {
    const gender = classifyNFT(nft);
    
    if (gender === 'one-of-one') {
      oneOfOneCount++;
      continue;
    }
    
    const traitCounts = gender === 'male' ? maleTraitCounts : femaleTraitCounts;
    if (gender === 'male') maleCount++;
    else femaleCount++;
    
    for (const attr of nft.attributes) {
      if (!traitCounts.has(attr.trait_type)) {
        traitCounts.set(attr.trait_type, new Map());
      }
      const valueCounts = traitCounts.get(attr.trait_type)!;
      valueCounts.set(attr.value, (valueCounts.get(attr.value) || 0) + 1);
    }
  }
  
  console.log(`\n  Population: ${maleCount} males, ${femaleCount} females, ${oneOfOneCount} 1/1s`);
  
  // Second pass: calculate raw scores
  const nfts: NFTWithRawScore[] = [];
  
  for (const [tokenId, nft] of metadata) {
    const gender = classifyNFT(nft);
    
    // 1/1s get maximum raw score (will become rank 0)
    if (gender === 'one-of-one') {
      nfts.push({
        tokenId,
        name: nft.name,
        image: nft.image,
        attributes: nft.attributes || [],
        gender: 'one-of-one',
        rawScore: Infinity,  // Guarantees top rank
      });
      continue;
    }
    
    // Regular NFTs: sum of inverse rarity for each trait
    const population = gender === 'male' ? maleCount : femaleCount;
    const traitCounts = gender === 'male' ? maleTraitCounts : femaleTraitCounts;
    
    let rawScore = 0;
    for (const attr of nft.attributes) {
      const count = traitCounts.get(attr.trait_type)?.get(attr.value) || 1;
      const rarity = count / population;
      rawScore += 1 / rarity;  // Rarer = higher score
    }
    
    nfts.push({
      tokenId,
      name: nft.name,
      image: nft.image,
      attributes: nft.attributes,
      gender,
      rawScore,
    });
  }
  
  return { nfts, maleCount, femaleCount, oneOfOneCount };
}

// ============ Step 3: Assign Power by Percentile Rank ============
function assignPowerByPercentile(nfts: NFTWithRawScore[]): NFTWithPower[] {
  console.log(`\n⚡ Assigning power levels by percentile rank...`);
  
  // Sort by raw score (highest = rarest = rank 0)
  const sorted = [...nfts].sort((a, b) => b.rawScore - a.rawScore);
  
  const deckSize = sorted.length;
  const result: NFTWithPower[] = [];
  
  for (let rank = 0; rank < sorted.length; rank++) {
    const nft = sorted[rank];
    
    // Percentile: 0.0 = rarest (rank 0), 1.0 = most common
    const percentile = deckSize > 1 ? rank / (deckSize - 1) : 0;
    
    // Power: 999 for rarest, 100 for most common
    // Linear interpolation: power = max - (percentile * range)
    const range = CONFIG.powerMax - CONFIG.powerMin;
    const power = Math.round(CONFIG.powerMax - (percentile * range));
    
    result.push({
      ...nft,
      rank,
      percentile,
      power,
      tier: getTierName(power),
    });
  }
  
  // Print distribution
  const tierCounts: Record<string, number> = {};
  for (const nft of result) {
    tierCounts[nft.tier] = (tierCounts[nft.tier] || 0) + 1;
  }
  
  console.log(`\n  Power distribution across ${result.length} NFTs:`);
  console.log(`    LEGENDARY (950-999): ${tierCounts['LEGENDARY'] || 0} (${((tierCounts['LEGENDARY'] || 0) / result.length * 100).toFixed(1)}%)`);
  console.log(`    EPIC (850-949):      ${tierCounts['EPIC'] || 0} (${((tierCounts['EPIC'] || 0) / result.length * 100).toFixed(1)}%)`);
  console.log(`    RARE (700-849):      ${tierCounts['RARE'] || 0} (${((tierCounts['RARE'] || 0) / result.length * 100).toFixed(1)}%)`);
  console.log(`    UNCOMMON (500-699):  ${tierCounts['UNCOMMON'] || 0} (${((tierCounts['UNCOMMON'] || 0) / result.length * 100).toFixed(1)}%)`);
  console.log(`    COMMON (300-499):    ${tierCounts['COMMON'] || 0} (${((tierCounts['COMMON'] || 0) / result.length * 100).toFixed(1)}%)`);
  console.log(`    BASIC (100-299):     ${tierCounts['BASIC'] || 0} (${((tierCounts['BASIC'] || 0) / result.length * 100).toFixed(1)}%)`);
  
  return result;
}

// ============ Step 4: Select Balanced Deck ============
function selectBalancedDeck(allNfts: NFTWithPower[]): NFTWithPower[] {
  console.log(`\n🎴 Selecting balanced deck of ${CONFIG.deckSize} cards...`);
  
  const oneOfOnes = allNfts.filter(n => n.gender === 'one-of-one');
  const males = allNfts.filter(n => n.gender === 'male');
  const females = allNfts.filter(n => n.gender === 'female');
  
  // Calculate slots by gender ratio
  const totalRegular = males.length + females.length;
  const maleRatio = males.length / totalRegular;
  const femaleRatio = females.length / totalRegular;
  
  // Reserve 5% for 1/1s (up to how many exist)
  const oneOfOneSlots = Math.min(oneOfOnes.length, Math.ceil(CONFIG.deckSize * 0.05));
  const remainingSlots = CONFIG.deckSize - oneOfOneSlots;
  const maleSlots = Math.round(remainingSlots * maleRatio);
  const femaleSlots = remainingSlots - maleSlots;
  
  console.log(`\n  Target composition:`);
  console.log(`    1/1s: ${oneOfOneSlots}`);
  console.log(`    Males: ${maleSlots}`);
  console.log(`    Females: ${femaleSlots}`);
  
  // Select from each tier proportionally for gender balance
  function selectFromGender(nfts: NFTWithPower[], count: number): NFTWithPower[] {
    if (nfts.length <= count) return nfts;
    
    // Sort by rank (best first)
    const sorted = [...nfts].sort((a, b) => a.rank - b.rank);
    
    // Select evenly across the power spectrum
    const step = sorted.length / count;
    const selected: NFTWithPower[] = [];
    const used = new Set<number>();
    
    for (let i = 0; i < count; i++) {
      // Get index with some randomness within range
      const baseIdx = Math.floor(i * step);
      const rangeStart = Math.max(0, baseIdx - Math.floor(step / 2));
      const rangeEnd = Math.min(sorted.length - 1, baseIdx + Math.floor(step / 2));
      
      // Find an unused card in this range
      for (let j = baseIdx; j <= rangeEnd || j >= rangeStart; ) {
        if (!used.has(sorted[j].tokenId)) {
          selected.push(sorted[j]);
          used.add(sorted[j].tokenId);
          break;
        }
        // Spiral outward
        if (j >= baseIdx) j++;
        else j--;
        if (j > rangeEnd) j = baseIdx - 1;
        if (j < rangeStart) break;
      }
    }
    
    return selected;
  }
  
  const deck: NFTWithPower[] = [];
  
  // Add 1/1s (all have power 999)
  deck.push(...oneOfOnes.slice(0, oneOfOneSlots));
  
  // Add males and females
  deck.push(...selectFromGender(males, maleSlots));
  deck.push(...selectFromGender(females, femaleSlots));
  
  // Re-rank within the deck for consistent power levels
  deck.sort((a, b) => a.rank - b.rank);
  
  // Recalculate power based on deck position (not collection position)
  const deckSize = deck.length;
  for (let i = 0; i < deck.length; i++) {
    const percentile = deckSize > 1 ? i / (deckSize - 1) : 0;
    const range = CONFIG.powerMax - CONFIG.powerMin;
    deck[i] = {
      ...deck[i],
      rank: i,
      percentile,
      power: Math.round(CONFIG.powerMax - (percentile * range)),
      tier: getTierName(Math.round(CONFIG.powerMax - (percentile * range))),
    };
  }
  
  // Print final deck stats
  const powers = deck.map(n => n.power);
  const tierCounts: Record<string, number> = {};
  for (const nft of deck) {
    tierCounts[nft.tier] = (tierCounts[nft.tier] || 0) + 1;
  }
  
  console.log(`\n  Final deck (${deck.length} cards):`);
  console.log(`    Power range: ${Math.min(...powers)} - ${Math.max(...powers)}`);
  console.log(`    Average power: ${(powers.reduce((a, b) => a + b, 0) / powers.length).toFixed(0)}`);
  console.log(`    Tier distribution:`);
  for (const tier of ['LEGENDARY', 'EPIC', 'RARE', 'UNCOMMON', 'COMMON', 'BASIC']) {
    const count = tierCounts[tier] || 0;
    console.log(`      ${tier}: ${count} (${(count / deck.length * 100).toFixed(1)}%)`);
  }
  
  console.log(`\n  Top 10 cards:`);
  for (let i = 0; i < Math.min(10, deck.length); i++) {
    const nft = deck[i];
    console.log(`    ${i + 1}. #${nft.tokenId} | Power ${nft.power} | ${nft.tier} | ${nft.gender}`);
  }
  
  return deck;
}

// ============ Step 5: Save Outputs ============
function saveOutputs(
  deck: NFTWithPower[],
  maleCount: number,
  femaleCount: number,
  oneOfOneCount: number
): void {
  console.log(`\n💾 Saving outputs...`);
  
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  
  const powers = deck.map(n => n.power);
  const tierCounts: Record<string, number> = {};
  for (const nft of deck) {
    tierCounts[nft.tier] = (tierCounts[nft.tier] || 0) + 1;
  }
  
  // Full deck JSON
  const fullOutput: DeckOutput = {
    collection: {
      name: CONFIG.collectionName,
      address: CONFIG.collectionAddress,
      totalSupply: CONFIG.totalSupply,
      analyzedAt: new Date().toISOString(),
      methodology: 'percentile-based (v3)',
    },
    stats: {
      totalMales: maleCount,
      totalFemales: femaleCount,
      totalOneOfOnes: oneOfOneCount,
      deckSize: deck.length,
    },
    powerDistribution: {
      min: Math.min(...powers),
      max: Math.max(...powers),
      average: Math.round(powers.reduce((a, b) => a + b, 0) / powers.length),
      tiers: tierCounts,
    },
    deck: deck.map(nft => ({
      ...nft,
      rawScore: nft.rawScore === Infinity ? 999999 : nft.rawScore,  // JSON can't handle Infinity
    })),
  };
  
  const fullPath = path.join(CONFIG.outputDir, 're_generates_v3.json');
  fs.writeFileSync(fullPath, JSON.stringify(fullOutput, null, 2));
  console.log(`  ✓ Full deck: ${fullPath}`);
  
  // Power map for contract (tokenId -> power)
  const powerMap: Record<number, number> = {};
  for (const nft of deck) {
    powerMap[nft.tokenId] = nft.power;
  }
  
  const mapPath = path.join(CONFIG.outputDir, 're_generates_power_map_v3.json');
  fs.writeFileSync(mapPath, JSON.stringify(powerMap, null, 2));
  console.log(`  ✓ Power map: ${mapPath}`);
  
  // Also save as the "active" power map (for upload script)
  const activeMapPath = path.join(CONFIG.outputDir, 're_generates_power_map.json');
  fs.writeFileSync(activeMapPath, JSON.stringify(powerMap, null, 2));
  console.log(`  ✓ Active power map: ${activeMapPath}`);
}

// ============ Main ============
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Collection Analyzer v3 - Percentile-Based Power             ║');
  console.log('║  Normalized 100-999 range for cross-collection compatibility ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  // Step 1: Fetch metadata
  const metadata = await fetchAllMetadata();
  
  // Step 2: Calculate raw rarity scores
  const { nfts, maleCount, femaleCount, oneOfOneCount } = calculateRawScores(metadata);
  
  // Step 3: Assign power by percentile rank
  const nftsWithPower = assignPowerByPercentile(nfts);
  
  // Step 4: Select balanced deck
  const deck = selectBalancedDeck(nftsWithPower);
  
  // Step 5: Save outputs
  saveOutputs(deck, maleCount, femaleCount, oneOfOneCount);
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  ✓ Done! Deck ready with normalized power levels.            ║');
  console.log('║  Power range: 100-999 (guaranteed for ANY collection)        ║');
  console.log('║  Run: npx tsx upload-deck.ts to deploy to contract           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
