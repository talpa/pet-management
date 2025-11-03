// Quick Supabase connection test
const { Pool } = require('pg');

const databaseUrl = process.argv[2];

if (!databaseUrl) {
    console.log('❌ Usage: node supabase-test.js "postgresql://..."');
    process.exit(1);
}

console.log('🔄 Testing Supabase connection...');

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    try {
        // Test basic connection
        const timeResult = await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful');
        console.log('📅 Server time:', timeResult.rows[0].now);
        
        // Test tables
        const tablesResult = await pool.query(`
            SELECT table_name, 
                   (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
            FROM information_schema.tables t
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        console.log(`\n📊 Found ${tablesResult.rows.length} tables:`);
        tablesResult.rows.forEach(table => {
            console.log(`  ✓ ${table.table_name} (${table.columns} columns)`);
        });
        
        // Test sample data
        console.log('\n🔍 Sample data:');
        
        const speciesResult = await pool.query('SELECT COUNT(*) as count FROM animal_species');
        console.log(`  Animal species: ${speciesResult.rows[0].count} records`);
        
        const tagsResult = await pool.query('SELECT COUNT(*) as count FROM animal_tags');
        console.log(`  Animal tags: ${tagsResult.rows[0].count} records`);
        
        const animalsResult = await pool.query('SELECT COUNT(*) as count FROM animals');
        console.log(`  Animals: ${animalsResult.rows[0].count} records`);
        
        const permissionsResult = await pool.query('SELECT COUNT(*) as count FROM permissions');
        console.log(`  Permissions: ${permissionsResult.rows[0].count} records`);
        
        console.log('\n🎉 Supabase database is ready!');
        
    } catch (error) {
        console.log('❌ Database error:', error.message);
        if (error.message.includes('does not exist')) {
            console.log('\n💡 Suggestion: Run migrations first in Supabase SQL Editor');
            console.log('1. Copy content from migrations/001_create_tables.sql');
            console.log('2. Copy content from migrations/002_insert_data.sql');
        }
    } finally {
        await pool.end();
    }
}

testConnection();