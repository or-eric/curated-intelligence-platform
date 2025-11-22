import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function checkData() {
    const res = await db.query(`
        SELECT title, summary, analysis, total_score, score_band 
        FROM content_items 
        WHERE title LIKE '%Motorola%'
        LIMIT 1
    `);

    if (res.rows.length > 0) {
        console.log('Item:', res.rows[0].title);
        console.log('Summary:', JSON.stringify(res.rows[0].summary, null, 2).substring(0, 200) + '...');
        console.log('Analysis:', JSON.stringify(res.rows[0].analysis, null, 2).substring(0, 200) + '...');
        console.log('Score:', res.rows[0].total_score, res.rows[0].score_band);
    } else {
        console.log('No processed items found.');
    }
    process.exit();
}

checkData();
