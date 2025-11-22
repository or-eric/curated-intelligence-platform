import { RssService } from '../src/backend/services/rss.service.js';
import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';
import path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function debugCandidates() {
    const rssService = new RssService();

    console.log('Fetching active feeds from DB...');
    const feedsResult = await db.query('SELECT url, name FROM feeds WHERE is_active = true');
    const feeds = feedsResult.rows;
    console.log(`Found ${feeds.length} active feeds in DB:`, feeds.map(f => f.name).join(', '));

    console.log('\nChecking each feed...');

    for (const feed of feeds) {
        console.log(`\n--- Fetching ${feed.name} (${feed.url}) ---`);
        try {
            const items = await rssService.fetchFeed(feed.url);
            console.log(`Fetched ${items.length} items.`);
            if (items.length > 0) {
                console.log('First 3 items:');
                items.slice(0, 3).forEach(item => {
                    console.log(`- [${item.pubDate}] ${item.title}`);
                });
            }
        } catch (err) {
            console.error(`ERROR fetching ${feed.name}:`, err.message);
        }
    }

    await db.end();
}

debugCandidates();
