import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';
import path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function checkTC() {
    try {
        const result = await db.query("SELECT title, summary FROM content_items WHERE url LIKE '%techcrunch%' ORDER BY created_at DESC LIMIT 1");
        if (result.rows.length > 0) {
            console.log('TC Item Title:', result.rows[0].title);
            console.log('TC Item Summary Keys:', Object.keys(result.rows[0].summary));
        } else {
            console.log('No TechCrunch items found.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
}

checkTC();
