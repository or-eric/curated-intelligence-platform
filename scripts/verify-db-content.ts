import { db } from '../src/backend/services/db.service.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function verifyDbContent() {
    console.log('Verifying latest content items...');
    try {
        const result = await db.query('SELECT title, summary, analysis FROM content_items ORDER BY created_at DESC LIMIT 1');

        if (result.rows.length === 0) {
            console.log('No items found.');
            return;
        }

        const item = result.rows[0];
        console.log('Title:', item.title);

        console.log('\n--- Summary Column (Executive Summary Tab) ---');
        // summary column now holds the executive_summary_tab + metadata
        console.log(JSON.stringify(item.summary, null, 2));

        console.log('\n--- Analysis Column (Strategic Implications Tab) ---');
        console.log(JSON.stringify(item.analysis, null, 2));

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyDbContent();
