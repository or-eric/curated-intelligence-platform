import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function checkSchema() {
    try {
        const feeds = await sql`SELECT * FROM feeds LIMIT 1`;
        console.log('Feeds Schema:', Object.keys(feeds.rows[0] || {}));

        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'content_items'
        `;
        console.log('Content Columns:', columns.rows.map(r => r.column_name));
    } catch (error) {
        console.error('Error checking schema:', error);
    }
}

checkSchema();
