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
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const page = parseInt(url.searchParams.get('page') || '1');
        const offset = (page - 1) * limit;

        console.log('Connecting to database via neon serverless...');
        // Note: in edge, we don't need explicit connect(), query() handles it, but let's be safe
        const result = await pool.query(`
            SELECT * FROM content_items 
            ORDER BY published_at DESC 
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

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
        // In edge, we might not strictly need to end, but good practice
        // However, for serverless driver over HTTP, it's stateless mostly.
        // But let's call end() to be clean.
        await pool.end();
    }
}
