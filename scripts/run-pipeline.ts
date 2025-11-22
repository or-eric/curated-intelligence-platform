import dotenv from 'dotenv';
import path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function runPipeline() {
    // Dynamic imports to ensure env vars are loaded first
    const { runIngestion } = await import('../src/backend/workflows/ingestion.js');
    const { runExtraction } = await import('../src/backend/workflows/extraction.js');
    const { runScoring } = await import('../src/backend/workflows/scoring.js');
    const { db } = await import('../src/backend/services/db.service.js');

    console.log('=== STARTING CONTENT PIPELINE ===');
    const startTime = Date.now();

    try {
        // Phase 1: Ingestion
        console.log('\n--- PHASE 1: INGESTION ---');
        const ingestResults = await runIngestion(10); // Limit 10 new items
        console.log('Ingestion Results:', ingestResults);

        // Phase 2: Extraction
        console.log('\n--- PHASE 2: EXTRACTION ---');
        const extractResults = await runExtraction(10);
        console.log('Extraction Results:', extractResults);

        // Phase 3: Scoring
        console.log('\n--- PHASE 3: SCORING ---');
        const scoreResults = await runScoring(10);
        console.log('Scoring Results:', scoreResults);

    } catch (error) {
        console.error('Pipeline Error:', error);
    } finally {
        const duration = (Date.now() - startTime) / 1000;
        console.log(`\n=== PIPELINE COMPLETE (${duration}s) ===`);
        await db.end();
    }
}

runPipeline();
