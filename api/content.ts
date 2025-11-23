import { Pool } from '@neondatabase/serverless';

export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request) {
    console.log('API Invoked: /api/content (using @neondatabase/serverless)');

    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const timeRange = url.searchParams.get('timeRange') || 'all';
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const page = parseInt(url.searchParams.get('page') || '1');
        const offset = (page - 1) * limit;

        console.log('Connecting to database via neon serverless...');

        let result;
        if (id) {
            result = await pool.query(`SELECT * FROM content_items WHERE id = $1`, [id]);
        } else {
            let timeFilter = '';
            if (timeRange === '24h') {
                timeFilter = `WHERE published_at >= NOW() - INTERVAL '24 hours'`;
            } else if (timeRange === '7d') {
                timeFilter = `WHERE published_at >= NOW() - INTERVAL '7 days'`;
            } else if (timeRange === '30d') {
                timeFilter = `WHERE published_at >= NOW() - INTERVAL '30 days'`;
            }

            result = await pool.query(`
                SELECT * FROM content_items 
                ${timeFilter}
                ORDER BY published_at DESC 
                LIMIT $1 OFFSET $2
            `, [limit, offset]);
        }

        console.log(`Found ${result.rows.length} items.`);

        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            }
        });
    } catch (error: any) {
        console.error('Error in /api/content:', error);
        return new Response(JSON.stringify({
            error: 'Failed to fetch content',
            details: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        await pool.end();
    }
}
