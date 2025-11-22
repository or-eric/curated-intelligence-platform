import { runIngestion } from '../src/backend/workflows/ingestion.js';

export const config = {
    maxDuration: 60, // Increase timeout for AI processing
};

export default async function handler(request: Request) {
    try {
        // Basic security: Check for a secret token if needed, 
        // but for now we'll leave it open or rely on Vercel Cron protection.
        // If called via GET, it triggers the ingestion.

        const url = new URL(request.url);
        const limitParam = url.searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : 3; // Default to 3 to avoid timeouts

        console.log(`Starting ingestion with limit: ${limit}`);
        const results = await runIngestion(limit);

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Ingestion failed:', error);
        return new Response(JSON.stringify({ error: 'Ingestion failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
