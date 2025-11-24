import http from 'http';
import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const PORT = 3001;

const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url || '', `http://${req.headers.host}`);

    if (url.pathname === '/api/content') {
        try {
            const limit = parseInt(url.searchParams.get('limit') || '20');
            const page = parseInt(url.searchParams.get('page') || '1');
            const timeRange = url.searchParams.get('timeRange') || 'all';
            const offset = (page - 1) * limit;

            console.log(`Fetching content: page=${page}, limit=${limit}, timeRange=${timeRange}`);

            let timeFilter = '';
            if (timeRange === '24h') {
                timeFilter = `WHERE published_at >= NOW() - INTERVAL '24 hours'`;
            } else if (timeRange === '7d') {
                timeFilter = `WHERE published_at >= NOW() - INTERVAL '7 days'`;
            } else if (timeRange === '30d') {
                timeFilter = `WHERE published_at >= NOW() - INTERVAL '30 days'`;
            }

            const result = await db.query(`
                SELECT * FROM content_items 
                ${timeFilter}
                ORDER BY published_at DESC 
                LIMIT $1 OFFSET $2
            `, [limit, offset]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows));
        } catch (error: any) {
            console.error('Error fetching content:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Local API server running on port ${PORT}`);
});
