import { db } from '../src/backend/services/db.service.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function resetDb() {
    console.log('Clearing content_items table...');
    try {
        await db.query('DELETE FROM content_items');
        console.log('Table cleared.');
    } catch (error) {
        console.error('Failed to clear table:', error);
    }
}

resetDb();
