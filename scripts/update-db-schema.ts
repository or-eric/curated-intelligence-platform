import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';
import path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function updateSchema() {
    console.log('Updating database schema...');
    try {
        // Add type column if it doesn't exist, default to 'RSS'
        await db.query(`
            ALTER TABLE feeds 
            ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'RSS' CHECK (type IN ('RSS', 'WEB'));
        `);
        console.log('Successfully added "type" column to "feeds" table.');

        // Verify
        const result = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'feeds'");
        console.log('Feeds table columns:', result.rows.map(r => r.column_name).join(', '));

    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        await db.end();
    }
}

updateSchema();
