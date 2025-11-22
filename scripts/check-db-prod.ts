import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function checkProdDb() {
    console.log('Checking production database connectivity...');
    const connectionString = process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error('POSTGRES_URL not found in .env.production');
        return;
    }

    console.log('Connection string found (masked):', connectionString.replace(/:[^:]*@/, ':****@'));

    const db = createPool({
        connectionString: connectionString,
    });

    try {
        console.log('Connecting...');
        const start = Date.now();
        const result = await db.query('SELECT 1 as check_val');
        const duration = Date.now() - start;

        console.log(`Connected! Query took ${duration}ms`);
        console.log('Result:', result.rows);

        console.log('Checking content_items count...');
        const countResult = await db.query('SELECT COUNT(*) FROM content_items');
        console.log('Content items count:', countResult.rows[0].count);

    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await db.end();
    }
}

checkProdDb();
