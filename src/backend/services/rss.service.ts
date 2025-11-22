import Parser from 'rss-parser';

const parser = new Parser();

export interface FeedItem {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet?: string;
    isoDate?: string;
}

export class RssService {
    async fetchFeed(url: string): Promise<FeedItem[]> {
        try {
            // Fetch text first to handle invalid XML characters
            const response = await fetch(url);
            let text = await response.text();

            // Basic cleanup for common XML errors
            // 1. Fix unencoded & not part of an entity
            text = text.replace(/&(?!(?:[a-z]+|#[0-9]+|#x[0-9a-f]+);)/gi, '&amp;');
            // 2. Fix unencoded < that are not start of tags (rough heuristic: < followed by space or number)
            text = text.replace(/<(?=\s|[0-9])/g, '&lt;');

            const feed = await parser.parseString(text);
            return feed.items.map(item => ({
                title: item.title || '',
                link: item.link || '',
                pubDate: item.pubDate || '',
                contentSnippet: item.contentSnippet,
                isoDate: item.isoDate
            }));
        } catch (error) {
            console.error(`Error fetching feed ${url}:`, error);
            return [];
        }
    }
}

export const rssService = new RssService();
