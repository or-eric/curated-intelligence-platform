import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';
import path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function checkDbContent() {
    console.log('Checking latest content items...');
    try {
        const result = await db.query('SELECT id, title, summary, created_at FROM content_items ORDER BY created_at DESC LIMIT 5');

        result.rows.forEach(row => {
            console.log(`\n--- Item ID: ${row.id} ---`);
            console.log(`Title: ${row.title}`);
            console.log(`Created At: ${row.created_at}`);

            const summary = row.summary;
            if (summary) {
                console.log('Summary JSON keys:', Object.keys(summary));
                console.log('Cover Image:', summary.cover_image);
                console.log('Accountable Entity:', summary.accountable_entity);
                console.log('Assessment:', summary.assessment);
            } else {
                console.log('Summary is NULL or empty');
            }
        });

    } catch (err) {
        console.error('Error checking DB:', err);
    } finally {
        await db.end();
    }
}

checkDbContent();
