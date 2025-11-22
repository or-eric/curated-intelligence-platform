import { scraperService } from '../src/backend/services/scraper.service.js';

async function debugScraper() {
    const url = 'https://blog.google/';
    console.log(`Testing scraper on ${url}...`);
    try {
        const items = await scraperService.fetchFeed(url);
        console.log(`Found ${items.length} items:`);
        items.forEach(item => {
            if (item.title.includes('Nano Banana')) {
                console.log(`- Title: ${item.title}`);
                console.log(`  Link: ${item.link}`);
                console.log(`  Date: ${item.isoDate}`);
            }
        });
    } catch (err) {
        console.error('Error:', err);
    }
}

debugScraper();
