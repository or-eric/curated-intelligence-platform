import Parser from 'rss-parser';

const parser = new Parser();

export interface FeedItem {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet?: string;
}

export class RssService {
    async fetchFeed(url: string): Promise<FeedItem[]> {
        try {
            const feed = await parser.parseURL(url);
            return feed.items.map(item => ({
                title: item.title || '',
                link: item.link || '',
                pubDate: item.pubDate || '',
                contentSnippet: item.contentSnippet
            }));
        } catch (error) {
            console.error(`Error fetching feed ${url}:`, error);
            return [];
        }
    }
}
