import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';
import path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function checkAccenture() {
    try {
        const result = await db.query("SELECT count(*) FROM content_items WHERE url LIKE '%accenture%'");
        console.log('Accenture items count:', result.rows[0].count);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
}

checkAccenture();
