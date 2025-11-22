import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function cleanupDb() {
    try {
        console.log('Clearing all content items from database...');
        await sql`DELETE FROM content_items`;
        console.log('Database cleared successfully.');
    } catch (error) {
        console.error('Error clearing database:', error);
    }
}

cleanupDb();
