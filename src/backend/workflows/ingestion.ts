import { rssService } from '../services/rss.service.js';
import { scraperService } from '../services/scraper.service.js';
import { geminiService } from '../services/gemini.service.js';
import { db } from '../services/db.service.js';

export async function runIngestion(limit: number = 10) {
    console.log('Starting Phase 1: Ingestion & Normalization...');

    const results = {
        processed: 0,
        added: 0,
        rejected: 0,
        errors: 0,
        details: [] as string[]
    };

    // 1. Fetch active feeds
    const feeds = await db.query('SELECT * FROM feeds WHERE is_active = true');
    console.log(`Found ${feeds.rows.length} active feeds.`);

    let allCandidates: any[] = [];

    // 2. Collect candidates
    for (const feed of feeds.rows) {
        try {
            let items = [];
            if (feed.type === 'WEB') {
                items = await scraperService.fetchFeed(feed.url);
            } else {
                items = await rssService.fetchFeed(feed.url);
            }

            // Filter by date (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            for (const item of items) {
                const pubDate = item.isoDate ? new Date(item.isoDate) : new Date();

                // Check if exists
                const existing = await db.query('SELECT id FROM content_items WHERE url = $1', [item.link]);

                if (existing.rowCount === 0 && pubDate >= sevenDaysAgo) {

                    // Normalization & Heuristic Filtering
                    let content = item.contentSnippet || item.content || '';

                    // If WEB, we might need to fetch full content now to normalize/filter properly
                    let imageUrl = item.enclosure?.url || item.image?.url; // Try RSS image first

                    if (feed.type === 'WEB') {
                        const article = await scraperService.fetchArticleContent(item.link);
                        if (article) {
                            content = article.content;
                            if (article.title) item.title = article.title;
                            if (article.image) imageUrl = article.image; // Use scraped image if available
                        }
                    }

                    // Simple Heuristics
                    const isEnglish = true; // Placeholder for lang detection
                    const isLongEnough = content.length > 50; // Relaxed from 200
                    const isNotSpam = !/casino|gambling|lottery|promo code|deal/i.test(item.title);

                    if (isEnglish && isLongEnough && isNotSpam) {
                        // Clean HTML to Text (Basic)
                        const normalizedText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

                        await db.query(
                            `INSERT INTO content_items (title, url, published_at, status, source_id, media_type, normalized_text, author, image_url)
                             VALUES ($1, $2, $3, 'raw', $4, 'article', $5, $6, $7)`,
                            [
                                item.title,
                                item.link,
                                pubDate,
                                feed.id,
                                normalizedText,
                                item.creator || 'Unknown',
                                imageUrl
                            ]
                        );
                        results.added++;
                        results.details.push(`Ingested: ${item.title}`);
                        console.log(`Ingested: ${item.title}`); // Added log
                        if (results.added >= limit) break;
                    } else {
                        results.rejected++;
                        const reason = !isLongEnough ? `Length (${content.length})` : 'Spam';
                        console.log(`Rejected: ${item.title} (${reason})`);
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing feed ${feed.name}:`, error);
            results.errors++;
        }
        if (results.added >= limit) break;
    }

    return results;
}
