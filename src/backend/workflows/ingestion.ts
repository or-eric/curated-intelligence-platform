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

export async function runIngestion(limit: number = 5, sourceFilter?: string) {
    console.log('Starting ingestion phase...');
    const sources = await readSources();
    console.log(`Found ${sources.length} sources in configuration.`);

    for (const source of sources) {
        if (sourceFilter && !source.name.toLowerCase().includes(sourceFilter.toLowerCase())) {
            continue;
        }
        console.log(`Processing source: ${source.name} (${source.url})`);

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

            // 2. If that fails, try common RSS suffixes (only for 'auto' or 'rss_or_email')
            if (!feed && (source.ingest.method === 'auto' || source.ingest.method === 'rss_or_email')) {
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
                for (const item of feedItems.slice(0, limit)) { // Limit items per source
                    if (!item.link || !item.title) continue;

                    // Check if exists
                    const existing = await database.getContentItem(item.link);
                    if (existing) {
                        console.log(`  - Skipping existing item: ${item.title}`);
                        continue;
                    }

                    let rawContent = '';
                    let imageUrl = item.image?.url || item.itunes?.image;

                    // Handle specific types
                    if (source.ingest.method === 'podcast_rss') {
                        // For podcasts, raw_content is the description + audio link
                        rawContent = `[PODCAST] ${item.contentSnippet || item.content || ''}\n\nAudio: ${item.enclosure?.url || ''}`;
                        if (!imageUrl && item.itunes?.image) imageUrl = item.itunes.image;
                    } else if (source.ingest.method === 'youtube') {
                        // For YouTube, raw_content is description + video link
                        rawContent = `[YOUTUBE] ${item.contentSnippet || item.content || ''}\n\nVideo: ${item.link}`;
                        // YouTube RSS often has media:group with media:thumbnail
                        if (!imageUrl && item['media:group'] && item['media:group']['media:thumbnail']) {
                            imageUrl = item['media:group']['media:thumbnail'][0]?.$.url;
                        }
                    } else {
                        // Standard Web Scrape
                        try {
                            const scrapedData = await scraperService.fetchArticleContent(item.link);
                            rawContent = scrapedData.content;
                            if (!imageUrl) imageUrl = scrapedData.image;
                        } catch (err) {
                            console.warn(`    - Failed to scrape ${item.link}, using RSS summary.`);
                            rawContent = item.content || item.contentSnippet || '';
                        }
                    }

                    // Save to DB
                    await database.addContentItem({
                        url: item.link,
                        title: item.title,
                        source: source.name,
                        source_id: source.id,
                        published_date: item.isoDate || new Date().toISOString(),
                        raw_content: rawContent,
                        summary: JSON.stringify({ content: item.contentSnippet || '' }),
                        image_url: imageUrl || item.enclosure?.url,
                        status: 'raw',
                        tags: source.topics,
                        topics: source.domains
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
