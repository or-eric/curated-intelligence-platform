import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function reprocessAll() {
    // Dynamic imports to ensure env vars are loaded first
    const { runExtraction } = await import('../src/backend/workflows/extraction.js');
    const { runScoring } = await import('../src/backend/workflows/scoring.js');
    const { db } = await import('../src/backend/services/db.service.js');

    console.log('=== STARTING CONTENT REPROCESSING ===');
    const startTime = Date.now();

    try {
        // 1. Reset Status
        console.log('\n--- PHASE 0: RESET STATUS ---');
        console.log('Resetting all items to "raw" status...');
        const resetResult = await db.query(`UPDATE content_items SET status = 'raw'`);
        console.log(`Reset ${resetResult.rowCount} items.`);

        // 2. Extraction
        console.log('\n--- PHASE 1: EXTRACTION ---');
        // Process in batches to avoid timeouts/limits if needed, but runExtraction handles limit
        // We'll set a high limit to cover all items (assuming < 1000 for now)
        const extractResults = await runExtraction(1000);
        console.log('Extraction Results:', extractResults);

        // 3. Scoring
        console.log('\n--- PHASE 2: SCORING ---');
        const scoreResults = await runScoring(1000);
        console.log('Scoring Results:', scoreResults);

    } catch (error) {
        console.error('Reprocessing Error:', error);
    } finally {
        const duration = (Date.now() - startTime) / 1000;
        console.log(`\n=== REPROCESSING COMPLETE (${duration}s) ===`);
        await db.end();
    }
}

reprocessAll();
