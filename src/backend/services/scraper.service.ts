import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export class ScraperService {

    /**
     * Fetches a webpage and extracts potential article links.
     * This is a heuristic approach: it looks for links that look like articles
     * (e.g., have dates in URL, or are within 'article' tags, or have specific classes).
     */
    async fetchFeed(url: string): Promise<any[]> {
        console.log(`Scraping ${url}...`);
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            const candidates: any[] = [];
            const seenUrls = new Set<string>();

            // Heuristic: Look for links inside common article containers or with specific attributes
            // This is a generic "catch-all" strategy. For specific sites, we might need custom selectors.
            $('a').each((_, element) => {
                let href = $(element).attr('href');
                if (!href) return;

                // Normalize URL (handle relative URLs)
                let fullUrl;
                try {
                    fullUrl = new URL(href, url).href;
                } catch (e) {
                    return;
                }

                // Filter out obviously non-article links
                if (seenUrls.has(fullUrl)) return;
                if (fullUrl === url) return; // Self link
                if (!fullUrl.startsWith('http')) return;
                if (fullUrl.includes('/tag/') || fullUrl.includes('/category/') || fullUrl.includes('/author/')) return;
                if (fullUrl.match(/\.(jpg|jpeg|png|gif|pdf|zip)$/i)) return;

                // Basic heuristic: Link text length > 20 chars usually indicates a title
                let title = $(element).text().trim();
                if (!title || title.length < 5) {
                    title = $(element).attr('aria-label') || '';
                }

                if (title.length < 20) return;

                // Heuristic: URL contains year/month (common in blogs) OR title is substantial
                // We'll be permissive here and let the AI filter later, but we need *some* content.

                candidates.push({
                    title: title,
                    link: fullUrl,
                    pubDate: new Date().toISOString(), // We often can't get date from list view easily
                    contentSnippet: title, // Use title as snippet for now
                    isoDate: new Date().toISOString()
                });
                seenUrls.add(fullUrl);
            });

            console.log(`Found ${candidates.length} links on ${url}`);
            return candidates.slice(0, 20); // Limit to top 20 to avoid overload

        } catch (error) {
            console.error(`Error scraping ${url}:`, error);
            return [];
        }
    }

    /**
     * Fetches a specific article page and extracts its content using Readability.
     */
    async fetchArticleContent(url: string): Promise<{ content: string, title: string, excerpt: string, image?: string } | null> {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Referer': 'https://www.google.com/'
                }
            });
            const html = await response.text();
            const doc = new JSDOM(html, { url });
            const reader = new Readability(doc.window.document);
            const article = reader.parse();

            if (article) {
                return {
                    content: article.content, // HTML content
                    title: article.title,
                    excerpt: article.excerpt,
                    image: this.extractImage(doc.window.document)
                };
            }
            return null;
        } catch (error) {
            console.error(`Error parsing article ${url}:`, error);
            return null;
        }
    }

    private extractImage(document: Document): string | undefined {
        const getMeta = (prop: string) => document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`)?.getAttribute('content');
        return getMeta('og:image') || getMeta('twitter:image') || undefined;
    }
}

export const scraperService = new ScraperService();
