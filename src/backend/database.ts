import { db } from './services/db.service';

export const database = {
    async getContentItem(url: string) {
        const result = await db.query('SELECT * FROM content_items WHERE url = $1', [url]);
        return result.rows[0];
    },

    async addContentItem(item: {
        url: string;
        title: string;
        source: string;
        published_date: string;
        raw_content: string;
        summary: string;
        image_url?: string;
        status: string;
        tags?: string[];
        topics?: string[];
    }) {
        await db.query(
            `INSERT INTO content_items (url, title, source, published_at, normalized_text, summary, image_url, status, tags, topics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (url) DO NOTHING`,
            [
                item.url,
                item.title,
                item.source,
                item.published_date,
                item.raw_content, // Maps to normalized_text
                item.summary,
                item.image_url,
                item.status,
                item.tags,
                item.topics
            ]
        );
    }
};
