import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function testIngestProd() {
    // Dynamic import to ensure env vars are loaded before service instantiation
    const { runIngestion } = await import('../src/backend/workflows/ingestion.js');

    console.log('Testing ENHANCED ingestion with Selection + Deep Analysis...');
    const start = Date.now();

    try {
        // Limit 10 to process at most 10 selected stories
        const results = await runIngestion(10);
        console.log('Ingestion complete!');
        console.log('Results:', results);
    } catch (error) {
        console.error('Ingestion failed:', error);
    }

    const duration = Date.now() - start;
    console.log(`Total duration: ${duration}ms`);
}

testIngestProd();
