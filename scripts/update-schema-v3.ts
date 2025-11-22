import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function updateSchema() {
    console.log('Updating schema...');
    try {
        // Add image_url column
        await db.query(`
            ALTER TABLE content_items 
            ADD COLUMN IF NOT EXISTS image_url TEXT;
        `);
        console.log('Added image_url column.');

        // Add tags column (for Personas)
        await db.query(`
            ALTER TABLE content_items 
            ADD COLUMN IF NOT EXISTS tags TEXT[];
        `);
        console.log('Added tags column.');

        // Add topics column (for Domains)
        await db.query(`
            ALTER TABLE content_items 
            ADD COLUMN IF NOT EXISTS topics TEXT[];
        `);
        console.log('Added topics column.');

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        await db.end();
    }
}

updateSchema();
