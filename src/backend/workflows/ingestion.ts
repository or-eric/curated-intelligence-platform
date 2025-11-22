import { scraperService } from '../services/scraper.service';
import { database } from '../database';
import * as fs from 'fs';
import * as path from 'path';
import Parser from 'rss-parser';

const parser = new Parser();

interface SourceConfig {
    id: string;
    name: string;
    url: string;
    source_type: string;
    domains: string[];
    topics: string[];
    tier: string;
    ingest: {
        method: string;
        media_types: string[];
        transcript_required: boolean;
    };
}

interface SourcesConfig {
    schema_version: string;
    sources: SourceConfig[];
}

async function readSources(): Promise<SourceConfig[]> {
    const sourcesPath = path.join(process.cwd(), 'sources.json');
    try {
        const fileContent = fs.readFileSync(sourcesPath, 'utf-8');
        const config: SourcesConfig = JSON.parse(fileContent);
        return config.sources;
    } catch (error) {
        console.error('Error reading sources.json:', error);
        return [];
    }
}

export async function runIngestion() {
    console.log('Starting ingestion phase...');
    const sources = await readSources();
    console.log(`Found ${sources.length} sources in configuration.`);

    for (const source of sources) {
        console.log(`Processing source: ${source.name} (${source.url})`);

        // Skip unsupported ingestion methods for now
        if (source.ingest.method === 'podcast_rss' || source.ingest.method === 'youtube') {
            console.log(`Skipping ${source.name}: Ingestion method '${source.ingest.method}' not yet supported.`);
            continue;
        }

        try {
            let feedItems: any[] = [];
            let isRss = false;

            // Helper to try parsing a URL
            const tryParse = async (targetUrl: string) => {
                try {
                    const feed = await parser.parseURL(targetUrl);
                    if (feed && feed.items && feed.items.length > 0) {
                        return feed;
                    }
                } catch (e) {
                    return null;
                }
                return null;
            };

            // 1. Try the URL exactly as provided
            let feed = await tryParse(source.url);

            // 2. If that fails, try common RSS suffixes
            if (!feed) {
                const suffixes = ['/feed', '/rss', '/rss.xml', '/feed.xml', '/atom.xml'];
                for (const suffix of suffixes) {
                    // Ensure we don't double slash
                    const cleanUrl = source.url.replace(/\/$/, '');
                    feed = await tryParse(`${cleanUrl}${suffix}`);
                    if (feed) {
                        console.log(`  - Discovered RSS feed at: ${cleanUrl}${suffix}`);
                        break;
                    }
                }
            }

            if (feed) {
                feedItems = feed.items;
                isRss = true;
                console.log(`  - Detected valid RSS feed with ${feedItems.length} items.`);
            } else {
                console.log(`  - Could not find RSS feed for ${source.url}. Skipping for now.`);
            }

            if (isRss) {
                // Process RSS Items
                for (const item of feedItems.slice(0, 5)) { // Limit to 5 recent items
                    if (!item.link || !item.title) continue;

                    // Check if exists
                    const existing = await database.getContentItem(item.link);
                    if (existing) {
                        console.log(`  - Skipping existing item: ${item.title}`);
                        continue;
                    }

                    // Scrape full content
                    const scrapedData = await scraperService.fetchArticleContent(item.link);

                    // Save to DB
                    await database.addContentItem({
                        url: item.link,
                        title: item.title,
                        source: source.name,
                        published_date: item.isoDate || new Date().toISOString(),
                        raw_content: scrapedData.content, // Save the full scraped content
                        summary: JSON.stringify({ content: item.contentSnippet || '' }), // Initial RSS summary as JSON
                        image_url: scrapedData.image || item.enclosure?.url || item.image?.url, // Capture image
                        status: 'raw',
                        tags: source.topics, // Use source topics as initial tags
                        topics: source.domains // Use source domains as initial topics
                    });
                    console.log(`  - Ingested: ${item.title}`);
                }
            } else {
                // Web Scraper Fallback (for 'auto' method on non-RSS URLs)
                console.log(`  - RSS failed. Web crawling for ${source.url} is not fully implemented yet. Please provide a direct RSS URL if possible.`);
            }

        } catch (error) {
            console.error(`  - Error processing ${source.name}:`, error);
        }
    }
    console.log('Ingestion phase complete.');
}
