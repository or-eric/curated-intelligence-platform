import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';
import path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function fixFeedUrl() {
    const oldUrl = 'https://bankingblog.accenture.com/tag/cybersecurity';
    const newUrl = 'https://bankingblog.accenture.com/tag/cybersecurity/feed';

    console.log(`Updating feed URL from '${oldUrl}' to '${newUrl}'...`);

    try {
        const result = await db.query(
            'UPDATE feeds SET url = $1 WHERE url = $2 RETURNING *',
            [newUrl, oldUrl]
        );

        if (result.rowCount > 0) {
            console.log('Successfully updated feed URL:', result.rows[0]);
        } else {
            console.log('Feed not found or already updated.');
        }
    } catch (err) {
        console.error('Error updating feed:', err);
    } finally {
        await db.end();
    }
}

fixFeedUrl();
