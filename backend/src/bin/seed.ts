#!/usr/bin/env node

/**
 * Jednoduché spuštění seed skriptu pro naplnění databáze
 */

import { clearAndSeedDatabase } from '../scripts/seedDatabase';

async function runSeed() {
  console.log('🚀 Spouštím seed databáze...');
  
  try {
    const result = await clearAndSeedDatabase();
    console.log('\n✅ Seed úspěšně dokončen!');
    console.log('📊 Výsledek:', result);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed selhal:', error);
    process.exit(1);
  }
}

runSeed();