import { db } from '../src/backend/services/db.service.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function checkDb() {
    try {
        console.log('Checking database content...');
        const countResult = await db.query('SELECT COUNT(*) FROM content_items');
        const count = countResult.rows[0].count;
        console.log(`Total items in DB: ${count}`);

        if (count > 0) {
            const latest = await db.query('SELECT title, summary, analysis FROM content_items ORDER BY created_at DESC LIMIT 1');
            console.log('\nLatest Item:');
            console.log('Title:', latest.rows[0].title);
            console.log('Summary:', latest.rows[0].summary ? '✅ Present' : '❌ Missing');
            console.log('Analysis:', latest.rows[0].analysis ? '✅ Present' : '❌ Missing');
        }
    } catch (error) {
        console.error('Error checking DB:', error);
    }
}

checkDb();
