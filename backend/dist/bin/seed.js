#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seedDatabase_1 = require("../scripts/seedDatabase");
async function runSeed() {
    console.log('🚀 Spouštím seed databáze...');
    try {
        const result = await (0, seedDatabase_1.clearAndSeedDatabase)();
        console.log('\n✅ Seed úspěšně dokončen!');
        console.log('📊 Výsledek:', result);
        process.exit(0);
    }
    catch (error) {
        console.error('\n❌ Seed selhal:', error);
        process.exit(1);
    }
}
runSeed();
