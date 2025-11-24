import { runIngestion } from '../../src/backend/workflows/ingestion.js';
import { runExtraction } from '../../src/backend/workflows/extraction.js';
import { runScoring } from '../../src/backend/workflows/scoring.js';

export const config = {
    maxDuration: 300, // 5 minutes (requires Pro plan)
};

export default async function handler(request: Request) {
    // Verify Vercel Cron signature if needed, but for now rely on path obscurity/config
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

    try {
        console.log('=== STARTING CRON PIPELINE ===');
        const results: any = {};

        // Phase 1: Ingestion
        // Limit to 10 items to ensure we fit in the timeout
        results.ingestion = await runIngestion(10);

        // Phase 2: Extraction
        // Process up to 20 pending items
        results.extraction = await runExtraction(20);

        // Phase 3: Scoring
        // Score up to 20 pending items
        results.scoring = await runScoring(20);

        return new Response(JSON.stringify({ success: true, results }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Pipeline Cron Error:', error);
        return new Response(JSON.stringify({ error: 'Pipeline failed', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
