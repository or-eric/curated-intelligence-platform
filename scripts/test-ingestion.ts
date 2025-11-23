import dotenv from 'dotenv';
import path from 'path';
import { runIngestion } from '../src/backend/workflows/ingestion';
import { db } from '../src/backend/services/db.service';
import * as fs from 'fs';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Mock readSources to return only podcast/youtube sources
// We can't easily mock the internal function, so we'll just modify ingestion.ts temporarily OR 
// better, we'll just run ingestion and it will skip others if we filter in the loop? 
// No, runIngestion reads the file.
// Let's just create a temporary sources.json with only podcasts?
// Or better, let's just rely on the fact that I can modify runIngestion to accept a filter?
// No, I don't want to change the signature again.

// Actually, I can just create a temporary sources_test.json and point the script to it?
// But runIngestion hardcodes 'sources.json'.

// Let's just run the pipeline and wait? No, too slow.
// I will modify ingestion.ts to accept an optional 'sourceFilter' argument.

async function test() {
    console.log('Testing Podcast/YouTube Ingestion...');
    try {
        await runIngestion(5, 'Darknet Diaries');
        await runIngestion(5, 'John Hammond');
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

test();
