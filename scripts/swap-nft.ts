/**
 * Swap NFT into Deck
 * 
 * Adds your NFT to the deck by swapping out an equivalent-tier card.
 * Ensures fair power assignment based on actual rarity.
 * Also downloads and caches the image locally.
 * 
 * Usage: npx tsx swap-nft.ts <tokenId> [--dry-run]
 * 
 * Examples:
 *   npx tsx swap-nft.ts 1234           # Swap in NFT #1234
 *   npx tsx swap-nft.ts 1234 --dry-run # Preview without executing
 */

import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// Configuration
const CONFIG = {
  contractAddress: '0x24b42c1a7554f1db8ec90a3b28315c7e9bab7eae' as `0x${string}`,
  deckId: 1n,
  privateKey: process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`,
  cacheDir: './cache',
  // Local paths for power map and metadata
  powerMapFile: './frontend/public/data/decks/re_generates_power_map.json',
  metadataFile: './frontend/public/data/decks/re_generates_metadata.json',
  imagesDir: './frontend/public/images/decks/1',
  fullDeckFile: './frontend/data/decks/re_generates_v3.json',
  powerMin: 100,
  powerMax: 999,
};

const abi = parseAbi([
  'function addDeckCards(uint256 _deckId, uint256[] calldata _tokenIds, uint256[] calldata _powers) external',
  'function removeDeckCard(uint256 _deckId, uint256 _tokenId) external',
]);

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

interface DeckCard {
  tokenId: number;
  power: number;
  tier: string;
  gender: string;
}

type Gender = 'male' | 'female' | 'one-of-one';

function getImageExtension(url: string): string {
  if (url.includes('.png')) return '.png';
  if (url.includes('.jpg') || url.includes('.jpeg')) return '.jpg';
  if (url.includes('.gif')) return '.gif';
  if (url.includes('.webp')) return '.webp';
  if (url.includes('.svg')) return '.svg';
  return '.png';
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    const request = https.get(url, (response) => {
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
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
    
    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

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

function calculatePower(
  tokenId: number,
  targetNFT: NFTMetadata,
  allMetadata: Record<string, NFTMetadata>
): { power: number; tier: string; gender: Gender; rank: number; total: number } {
  const gender = classifyNFT(targetNFT);
  
  // 1/1s automatically get max power
  if (gender === 'one-of-one') {
    return { power: 999, tier: 'LEGENDARY', gender, rank: 1, total: 1 };
  }
  
  // Get all NFTs of same gender
  const genderNfts: NFTMetadata[] = [];
  for (const [, nft] of Object.entries(allMetadata)) {
    if (classifyNFT(nft) === gender) {
      genderNfts.push(nft);
    }
  }
  
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
  
  // Calculate raw scores for all
  interface NFTScore { tokenId: number; rawScore: number; }
  const scores: NFTScore[] = [];
  
  for (const [id, nft] of Object.entries(allMetadata)) {
    if (classifyNFT(nft) !== gender) continue;
    
    let rawScore = 0;
    for (const attr of nft.attributes || []) {
      const count = traitCounts.get(attr.trait_type)?.get(attr.value) || 1;
      rawScore += genderNfts.length / count;
    }
    scores.push({ tokenId: parseInt(id), rawScore });
  }
  
  scores.sort((a, b) => b.rawScore - a.rawScore);
  
  const rank = scores.findIndex(s => s.tokenId === tokenId);
  const percentile = rank / (scores.length - 1);
  const power = Math.round(CONFIG.powerMax - (percentile * (CONFIG.powerMax - CONFIG.powerMin)));
  
  return { power, tier: getTierName(power), gender, rank: rank + 1, total: scores.length };
}

function findSwapCandidate(
  incomingPower: number,
  incomingGender: Gender,
  currentDeck: DeckCard[]
): DeckCard | null {
  const incomingTier = getTierName(incomingPower);
  
  // Strategy: Find a card with SAME tier and SAME gender to swap out
  // This keeps the deck balanced
  
  // First try: exact tier + gender match (pick lowest power in that tier)
  const sameTierSameGender = currentDeck
    .filter(c => c.tier === incomingTier && c.gender === incomingGender)
    .sort((a, b) => a.power - b.power);
  
  if (sameTierSameGender.length > 0) {
    return sameTierSameGender[0]; // Lowest power in same tier/gender
  }
  
  // Second try: same tier, any gender
  const sameTier = currentDeck
    .filter(c => c.tier === incomingTier)
    .sort((a, b) => a.power - b.power);
  
  if (sameTier.length > 0) {
    return sameTier[0];
  }
  
  // Third try: adjacent tier, same gender
  const tierOrder = ['BASIC', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
  const tierIdx = tierOrder.indexOf(incomingTier);
  const adjacentTiers = [
    tierOrder[tierIdx - 1],
    tierOrder[tierIdx + 1]
  ].filter(Boolean);
  
  const adjacentSameGender = currentDeck
    .filter(c => adjacentTiers.includes(c.tier) && c.gender === incomingGender)
    .sort((a, b) => a.power - b.power);
  
  if (adjacentSameGender.length > 0) {
    return adjacentSameGender[0];
  }
  
  // Last resort: just pick lowest power card
  const sorted = [...currentDeck].sort((a, b) => a.power - b.power);
  return sorted[0] || null;
}

async function main() {
  const tokenId = parseInt(process.argv[2]);
  const dryRun = process.argv.includes('--dry-run');
  
  if (!tokenId || isNaN(tokenId)) {
    console.log('Usage: npx tsx swap-nft.ts <tokenId> [--dry-run]');
    console.log('Example: npx tsx swap-nft.ts 1234');
    process.exit(1);
  }
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  NFT Deck Swap Tool');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Load metadata
  const cacheFile = path.join(CONFIG.cacheDir, 're_generates_metadata.json');
  if (!fs.existsSync(cacheFile)) {
    console.error('❌ Metadata cache not found. Run analyze-collection-v2.ts first.');
    process.exit(1);
  }
  
  const allMetadata: Record<string, NFTMetadata> = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  const targetNFT = allMetadata[tokenId.toString()];
  
  if (!targetNFT) {
    console.error(`❌ NFT #${tokenId} not found in collection.`);
    process.exit(1);
  }
  
  // Load current deck
  const fullDeck = JSON.parse(fs.readFileSync(CONFIG.fullDeckFile, 'utf-8'));
  const currentDeck: DeckCard[] = fullDeck.deck.map((c: any) => ({
    tokenId: c.tokenId,
    power: c.power,
    tier: c.tier,
    gender: c.gender,
  }));
  
  // Check if already in deck
  if (currentDeck.some(c => c.tokenId === tokenId)) {
    console.log(`\n✅ NFT #${tokenId} is already in the deck!`);
    const card = currentDeck.find(c => c.tokenId === tokenId)!;
    console.log(`   Power: ${card.power} (${card.tier})`);
    process.exit(0);
  }
  
  // Calculate incoming NFT's power
  const { power, tier, gender, rank, total } = calculatePower(tokenId, targetNFT, allMetadata);
  
  console.log(`\n📥 INCOMING NFT:`);
  console.log(`   #${tokenId} - ${targetNFT.name}`);
  console.log(`   Gender: ${gender}`);
  if (gender === 'one-of-one') {
    console.log(`   ⭐ 1/1 Artwork - Automatic LEGENDARY status`);
  } else {
    console.log(`   Rarity Rank: #${rank} of ${total} ${gender}s`);
  }
  console.log(`   Calculated Power: ${power} (${tier})`);
  
  // Find swap candidate
  const swapOut = findSwapCandidate(power, gender, currentDeck);
  
  if (!swapOut) {
    console.error('❌ Could not find a suitable card to swap out.');
    process.exit(1);
  }
  
  const swapOutNFT = allMetadata[swapOut.tokenId.toString()];
  
  console.log(`\n📤 SWAP OUT:`);
  console.log(`   #${swapOut.tokenId} - ${swapOutNFT?.name || 'Unknown'}`);
  console.log(`   Gender: ${swapOut.gender}`);
  console.log(`   Current Power: ${swapOut.power} (${swapOut.tier})`);
  
  console.log(`\n📊 SWAP SUMMARY:`);
  console.log(`   Remove: #${swapOut.tokenId} (${swapOut.tier}, power ${swapOut.power})`);
  console.log(`   Add:    #${tokenId} (${tier}, power ${power})`);
  
  const powerDiff = power - swapOut.power;
  console.log(`   Net Power Change: ${powerDiff >= 0 ? '+' : ''}${powerDiff}`);
  
  if (dryRun) {
    console.log(`\n🔍 DRY RUN - No changes made.`);
    console.log(`   Run without --dry-run to execute the swap.`);
    console.log('═══════════════════════════════════════════════════════════\n');
    process.exit(0);
  }
  
  if (!CONFIG.privateKey) {
    console.error('\n❌ DEPLOYER_PRIVATE_KEY not set. Cannot execute swap.');
    process.exit(1);
  }
  
  // Execute on-chain swap
  console.log(`\n⚡ Executing swap on-chain...`);
  
  const account = privateKeyToAccount(CONFIG.privateKey);
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });
  
  // Step 1: Remove old card
  console.log(`   Removing #${swapOut.tokenId}...`);
  try {
    const removeHash = await walletClient.writeContract({
      address: CONFIG.contractAddress,
      abi,
      functionName: 'removeDeckCard',
      args: [CONFIG.deckId, BigInt(swapOut.tokenId)],
    });
    await publicClient.waitForTransactionReceipt({ hash: removeHash });
    console.log(`   ✅ Removed (tx: ${removeHash.slice(0, 10)}...)`);
  } catch (error: any) {
    console.error(`   ❌ Failed to remove: ${error.message}`);
    process.exit(1);
  }
  
  // Step 2: Add new card
  console.log(`   Adding #${tokenId} with power ${power}...`);
  try {
    const addHash = await walletClient.writeContract({
      address: CONFIG.contractAddress,
      abi,
      functionName: 'addDeckCards',
      args: [CONFIG.deckId, [BigInt(tokenId)], [BigInt(power)]],
    });
    await publicClient.waitForTransactionReceipt({ hash: addHash });
    console.log(`   ✅ Added (tx: ${addHash.slice(0, 10)}...)`);
  } catch (error: any) {
    console.error(`   ❌ Failed to add: ${error.message}`);
    process.exit(1);
  }
  
  // Update local files
  console.log(`\n💾 Updating local deck files...`);
  
  // Step 3: Download and cache the new image
  console.log(`   Downloading image for #${tokenId}...`);
  const ext = getImageExtension(targetNFT.image);
  const localImagePath = path.join(CONFIG.imagesDir, `${tokenId}${ext}`);
  const publicImagePath = `/images/decks/1/${tokenId}${ext}`;
  
  try {
    await downloadFile(targetNFT.image, localImagePath);
    console.log(`   ✅ Image cached locally`);
  } catch (error: any) {
    console.error(`   ⚠️  Failed to download image: ${error.message}`);
    console.log(`   The swap succeeded but image may not display correctly.`);
  }
  
  // Step 4: Update power map (public)
  const powerMap = JSON.parse(fs.readFileSync(CONFIG.powerMapFile, 'utf-8'));
  delete powerMap[swapOut.tokenId.toString()];
  powerMap[tokenId.toString()] = power;
  fs.writeFileSync(CONFIG.powerMapFile, JSON.stringify(powerMap, null, 2));
  console.log(`   ✅ Power map updated`);
  
  // Step 5: Update metadata cache (public)
  const metadataCache = JSON.parse(fs.readFileSync(CONFIG.metadataFile, 'utf-8'));
  delete metadataCache[swapOut.tokenId.toString()];
  metadataCache[tokenId.toString()] = {
    name: targetNFT.name,
    image: publicImagePath,
    attributes: targetNFT.attributes,
  };
  fs.writeFileSync(CONFIG.metadataFile, JSON.stringify(metadataCache, null, 2));
  console.log(`   ✅ Metadata cache updated`);
  
  // Step 6: Remove old image
  const oldImageFiles = fs.readdirSync(CONFIG.imagesDir).filter(f => f.startsWith(`${swapOut.tokenId}.`));
  for (const oldFile of oldImageFiles) {
    fs.unlinkSync(path.join(CONFIG.imagesDir, oldFile));
  }
  if (oldImageFiles.length > 0) {
    console.log(`   ✅ Old image removed`);
  }
  
  // Step 7: Update full deck file (if exists)
  if (fs.existsSync(CONFIG.fullDeckFile)) {
    fullDeck.deck = fullDeck.deck.filter((c: any) => c.tokenId !== swapOut.tokenId);
    fullDeck.deck.push({
      tokenId,
      name: targetNFT.name,
      image: publicImagePath,
      attributes: targetNFT.attributes,
      gender,
      rawScore: gender === 'one-of-one' ? 999999 : 0,
      rank,
      percentile: gender === 'one-of-one' ? 0 : rank / total,
      power,
      tier,
    });
    fullDeck.deck.sort((a: any, b: any) => b.power - a.power);
    fs.writeFileSync(CONFIG.fullDeckFile, JSON.stringify(fullDeck, null, 2));
    console.log(`   ✅ Full deck file updated`);
  }
  
  // Verify the new image exists
  if (fs.existsSync(localImagePath)) {
    const stats = fs.statSync(localImagePath);
    if (stats.size < 100) {
      console.log(`   ⚠️  Warning: Image file seems too small (${stats.size} bytes)`);
    }
  }
  
  console.log(`\n✅ SWAP COMPLETE!`);
  console.log(`   #${tokenId} is now in the deck with power ${power} (${tier})`);
  console.log(`   Image cached at: ${publicImagePath}`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Run verification
  console.log(`💡 Run verification: npx ts-node scripts/verify-deck-images.ts`);
}

main().catch(console.error);
