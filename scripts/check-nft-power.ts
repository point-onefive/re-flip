/**
 * Check NFT Power Score
 * 
 * Looks up the calculated power for any NFT based on collection-wide rarity.
 * This does NOT add it to the deck - just shows what power it SHOULD have.
 * 
 * Usage: npx tsx check-nft-power.ts <tokenId>
 */

import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONFIG = {
  cacheDir: './cache',
  collectionName: 're:generates',
  powerMin: 100,
  powerMax: 999,
};

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

function classifyNFT(nft: NFTMetadata): Gender {
  if (!nft.attributes || nft.attributes.length === 0) return 'one-of-one';
  const hasArtistTrait = nft.attributes.some(attr => 
    attr.trait_type.toLowerCase() === 'artist'
  );
  if (hasArtistTrait) return 'one-of-one';
  const hasFemaleTraits = nft.attributes.some(attr => attr.trait_type.includes('_'));
  return hasFemaleTraits ? 'female' : 'male';
}

function getTierName(power: number): string {
  if (power >= 950) return 'LEGENDARY';
  if (power >= 850) return 'EPIC';
  if (power >= 700) return 'RARE';
  if (power >= 500) return 'UNCOMMON';
  if (power >= 300) return 'COMMON';
  return 'BASIC';
}

async function main() {
  const tokenId = parseInt(process.argv[2]);
  
  if (!tokenId || isNaN(tokenId)) {
    console.log('Usage: npx tsx check-nft-power.ts <tokenId>');
    console.log('Example: npx tsx check-nft-power.ts 338');
    process.exit(1);
  }
  
  console.log(`\n🔍 Looking up NFT #${tokenId}...\n`);
  
  // Load cached metadata
  const cacheFile = path.join(CONFIG.cacheDir, 're_generates_metadata.json');
  if (!fs.existsSync(cacheFile)) {
    console.error('❌ Metadata cache not found. Run analyze-collection-v2.ts first.');
    process.exit(1);
  }
  
  const allMetadata: Record<string, NFTMetadata> = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  
  const targetNFT = allMetadata[tokenId.toString()];
  if (!targetNFT) {
    console.error(`❌ NFT #${tokenId} not found in metadata cache.`);
    process.exit(1);
  }
  
  const gender = classifyNFT(targetNFT);
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  NFT #${tokenId} - ${targetNFT.name}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Gender: ${gender}`);
  console.log(`  Traits: ${targetNFT.attributes?.length || 0}`);
  
  if (gender === 'one-of-one') {
    console.log(`\n⭐ This is a 1/1 artwork!`);
    console.log(`  Recommended Power: 999 (LEGENDARY)`);
    console.log('═══════════════════════════════════════════════════════════\n');
    return;
  }
  
  // Calculate trait rarity within gender
  const genderNfts: NFTMetadata[] = [];
  for (const [, nft] of Object.entries(allMetadata)) {
    if (classifyNFT(nft) === gender) {
      genderNfts.push(nft);
    }
  }
  
  console.log(`  Population (${gender}s): ${genderNfts.length}`);
  
  // Count trait occurrences
  const traitCounts = new Map<string, Map<string, number>>();
  for (const nft of genderNfts) {
    for (const attr of nft.attributes || []) {
      if (!traitCounts.has(attr.trait_type)) {
        traitCounts.set(attr.trait_type, new Map());
      }
      const valueCounts = traitCounts.get(attr.trait_type)!;
      valueCounts.set(attr.value, (valueCounts.get(attr.value) || 0) + 1);
    }
  }
  
  // Calculate raw scores for all NFTs in this gender
  interface NFTScore { tokenId: number; rawScore: number; }
  const scores: NFTScore[] = [];
  
  for (const [id, nft] of Object.entries(allMetadata)) {
    if (classifyNFT(nft) !== gender) continue;
    
    let rawScore = 0;
    for (const attr of nft.attributes || []) {
      const count = traitCounts.get(attr.trait_type)?.get(attr.value) || 1;
      const rarity = count / genderNfts.length;
      rawScore += 1 / rarity;
    }
    scores.push({ tokenId: parseInt(id), rawScore });
  }
  
  // Sort by score (highest = rarest)
  scores.sort((a, b) => b.rawScore - a.rawScore);
  
  // Find target's rank
  const rank = scores.findIndex(s => s.tokenId === tokenId);
  const percentile = rank / (scores.length - 1);
  const power = Math.round(CONFIG.powerMax - (percentile * (CONFIG.powerMax - CONFIG.powerMin)));
  const tier = getTierName(power);
  
  console.log(`\n📊 Rarity Analysis (among ${gender}s):`);
  console.log(`  Rank: #${rank + 1} of ${scores.length}`);
  console.log(`  Percentile: ${((1 - percentile) * 100).toFixed(1)}% (top ${((rank + 1) / scores.length * 100).toFixed(1)}%)`);
  console.log(`  Raw Score: ${scores[rank].rawScore.toFixed(2)}`);
  
  console.log(`\n⚡ Recommended Power: ${power} (${tier})`);
  
  // Show traits with rarity
  console.log(`\n📋 Trait Breakdown:`);
  for (const attr of targetNFT.attributes || []) {
    const count = traitCounts.get(attr.trait_type)?.get(attr.value) || 0;
    const pct = (count / genderNfts.length * 100).toFixed(1);
    const rarityLabel = count <= 10 ? '🔥 RARE' : count <= 50 ? '✨' : '';
    console.log(`  ${attr.trait_type}: ${attr.value} (${count}/${genderNfts.length} = ${pct}%) ${rarityLabel}`);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  To add this NFT to the deck with its calculated power:`);
  console.log(`  cast send $CONTRACT "addDeckCards(uint256,uint256[],uint256[])" 1 "[${tokenId}]" "[${power}]"`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
