import { runIngestion } from '../src/backend/workflows/ingestion.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testIngest() {
    console.log('Starting manual ingestion test...');
    const start = Date.now();

    try {
        const results = await runIngestion();
        console.log('Ingestion complete!');
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Ingestion failed:', error);
    }

    console.log(`Duration: ${(Date.now() - start) / 1000}s`);
}

testIngest();
