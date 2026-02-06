/**
 * Upload Deck to Contract Script
 * 
 * Uploads the power mapping deck to the NFTBattle contract
 * 
 * Usage: npx tsx upload-deck.ts
 */

import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import * as fs from 'fs';

// Configuration
const CONFIG = {
  contractAddress: '0x24B0eFB548AC550A333BEe98e18a48352a36705c' as `0x${string}`,
  collectionAddress: '0x56dFE6ae26bf3043DC8Fdf33bF739B4fF4B3BC4A' as `0x${string}`,
  privateKey: '0x97da745b1d58010c83dc2fdec2767970a82012effc3d19af5dbeaf573074fe3b' as `0x${string}`,
  deckFile: '../frontend/data/decks/re_generates_power_map.json',
  batchSize: 50, // Cards per transaction to avoid gas limits
  delayBetweenBatches: 5000, // 5 second delay between batches to avoid RPC issues
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const abi = parseAbi([
  'function addDeckCards(address _collection, uint256[] calldata _tokenIds, uint256[] calldata _powerLevels) external',
  'function getDeckSize(address _collection) external view returns (uint256)',
  'function clearDeck(address _collection) external',
]);

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Upload Deck to NFTBattle Contract');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Load power mapping
  console.log(`\n📂 Loading deck from ${CONFIG.deckFile}...`);
  const powerMap = JSON.parse(fs.readFileSync(CONFIG.deckFile, 'utf-8'));
  
  const tokenIds = Object.keys(powerMap).map(id => BigInt(id));
  const powerLevels = Object.values(powerMap).map(power => BigInt(power as number));
  
  console.log(`  Found ${tokenIds.length} cards in deck`);
  console.log(`  Power range: ${Math.min(...(Object.values(powerMap) as number[]))} - ${Math.max(...(Object.values(powerMap) as number[]))}`);
  
  // Setup clients
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
  
  console.log(`\n🔗 Connected to Base Sepolia`);
  console.log(`  Contract: ${CONFIG.contractAddress}`);
  console.log(`  Collection: ${CONFIG.collectionAddress}`);
  console.log(`  Wallet: ${account.address}`);
  
  // Check current deck size
  const currentDeckSize = await publicClient.readContract({
    address: CONFIG.contractAddress,
    abi,
    functionName: 'getDeckSize',
    args: [CONFIG.collectionAddress],
  });
  
  console.log(`\n📊 Current deck size: ${currentDeckSize}`);
  
  if (currentDeckSize > 0n) {
    console.log(`  Clearing existing deck...`);
    const clearHash = await walletClient.writeContract({
      address: CONFIG.contractAddress,
      abi,
      functionName: 'clearDeck',
      args: [CONFIG.collectionAddress],
    });
    await publicClient.waitForTransactionReceipt({ hash: clearHash });
    console.log(`  ✅ Deck cleared`);
    // Wait extra time after clearing to ensure RPC is synced
    await sleep(CONFIG.delayBetweenBatches);
  }
  
  // Upload in batches
  console.log(`\n📤 Uploading ${tokenIds.length} cards in batches of ${CONFIG.batchSize}...`);
  
  for (let i = 0; i < tokenIds.length; i += CONFIG.batchSize) {
    const batchTokenIds = tokenIds.slice(i, i + CONFIG.batchSize);
    const batchPowers = powerLevels.slice(i, i + CONFIG.batchSize);
    
    const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
    const totalBatches = Math.ceil(tokenIds.length / CONFIG.batchSize);
    
    process.stdout.write(`  Batch ${batchNum}/${totalBatches}...`);
    
    const hash = await walletClient.writeContract({
      address: CONFIG.contractAddress,
      abi,
      functionName: 'addDeckCards',
      args: [CONFIG.collectionAddress, batchTokenIds, batchPowers],
    });
    
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(` ✅ (tx: ${hash.slice(0, 10)}...)`);
    
    // Add delay between batches to let RPC sync
    if (i + CONFIG.batchSize < tokenIds.length) {
      await sleep(CONFIG.delayBetweenBatches);
    }
  }
  
  // Verify final deck size
  const finalDeckSize = await publicClient.readContract({
    address: CONFIG.contractAddress,
    abi,
    functionName: 'getDeckSize',
    args: [CONFIG.collectionAddress],
  });
  
  console.log(`\n✅ Upload complete!`);
  console.log(`  Final deck size: ${finalDeckSize}`);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Done! The deck is now live on the contract.');
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch(console.error);
