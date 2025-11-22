import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function addSourceId() {
    try {
        console.log('Adding source_id column to content_items...');
        await sql`
            ALTER TABLE content_items 
            ADD COLUMN IF NOT EXISTS source_id INTEGER REFERENCES feeds(id);
        `;
        console.log('Column added successfully.');
    } catch (error) {
        console.error('Error adding column:', error);
    }
}

addSourceId();
