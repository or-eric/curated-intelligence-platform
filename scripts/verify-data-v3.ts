import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function verifyData() {
    console.log('Verifying data...');
    try {
        const res = await db.query(`
            SELECT id, title, image_url, tags, topics, total_score, score_band 
            FROM content_items 
            WHERE status = 'processed' 
            LIMIT 5
        `);

        console.log(`Found ${res.rows.length} processed items.`);
        res.rows.forEach(item => {
            console.log('---');
            console.log(`Title: ${item.title}`);
            console.log(`Image URL: ${item.image_url ? 'Present' : 'MISSING'}`);
            console.log(`Tags (Personas): ${item.tags}`);
            console.log(`Topics (Domains): ${item.topics}`);
            console.log(`Score: ${item.total_score} (${item.score_band})`);
        });

    } catch (error) {
        console.error('Error verifying data:', error);
    } finally {
        await db.end();
    }
}

verifyData();
