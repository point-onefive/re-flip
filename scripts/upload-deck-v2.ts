/**
 * Upload Deck to NFTBattleV2 Contract
 * 
 * Uploads the power mapping deck to the NFTBattleV2 contract
 * V2 uses deckId instead of collection address
 * 
 * Usage: npx tsx upload-deck-v2.ts
 */

import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import * as fs from 'fs';

// Configuration
const CONFIG = {
  contractAddress: '0x24b42c1a7554f1db8ec90a3b28315c7e9bab7eae' as `0x${string}`,
  deckId: 1n, // Deck ID 1 = re:generates
  privateKey: process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`,
  deckFile: '../frontend/data/decks/re_generates_power_map.json',
  batchSize: 50, // Cards per transaction to avoid gas limits
  delayBetweenBatches: 3000, // 3 second delay between batches
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const abi = parseAbi([
  'function addDeckCards(uint256 _deckId, uint256[] calldata _tokenIds, uint256[] calldata _powers) external',
  'function setDeckActive(uint256 _deckId, bool _active) external',
  'function deckCounter() external view returns (uint256)',
]);

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Upload Deck to NFTBattleV2 Contract');
  console.log('═══════════════════════════════════════════════════════════');
  
  if (!CONFIG.privateKey) {
    console.error('❌ DEPLOYER_PRIVATE_KEY environment variable not set');
    process.exit(1);
  }
  
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
  console.log(`  Deck ID: ${CONFIG.deckId}`);
  console.log(`  Wallet: ${account.address}`);
  
  // Upload in batches
  console.log(`\n📤 Uploading ${tokenIds.length} cards in batches of ${CONFIG.batchSize}...`);
  
  for (let i = 0; i < tokenIds.length; i += CONFIG.batchSize) {
    const batchTokenIds = tokenIds.slice(i, i + CONFIG.batchSize);
    const batchPowers = powerLevels.slice(i, i + CONFIG.batchSize);
    
    const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
    const totalBatches = Math.ceil(tokenIds.length / CONFIG.batchSize);
    
    process.stdout.write(`  Batch ${batchNum}/${totalBatches}...`);
    
    try {
      const hash = await walletClient.writeContract({
        address: CONFIG.contractAddress,
        abi,
        functionName: 'addDeckCards',
        args: [CONFIG.deckId, batchTokenIds, batchPowers],
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      console.log(` ✅ (tx: ${hash.slice(0, 10)}...)`);
    } catch (error) {
      console.log(` ❌ Failed`);
      console.error(error);
      process.exit(1);
    }
    
    // Add delay between batches
    if (i + CONFIG.batchSize < tokenIds.length) {
      await sleep(CONFIG.delayBetweenBatches);
    }
  }
  
  // Activate deck
  console.log(`\n⚡ Activating deck...`);
  const activateHash = await walletClient.writeContract({
    address: CONFIG.contractAddress,
    abi,
    functionName: 'setDeckActive',
    args: [CONFIG.deckId, true],
  });
  await publicClient.waitForTransactionReceipt({ hash: activateHash });
  console.log(`  ✅ Deck activated!`);
  
  console.log(`\n✅ Upload complete!`);
  console.log(`  Total cards uploaded: ${tokenIds.length}`);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Done! The deck is now live on the V2 contract.');
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch(console.error);
