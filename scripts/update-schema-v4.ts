import { db } from '../src/backend/services/db.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function updateSchema() {
    console.log('Updating schema...');
    try {
        await db.query(`
            ALTER TABLE content_items 
            ADD COLUMN IF NOT EXISTS source TEXT;
        `);
        console.log('Added source column.');
    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        await db.end();
    }
}

updateSchema();
