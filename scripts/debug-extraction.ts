import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function debugExtraction() {
    // Reset one item to raw
    await db.query("UPDATE content_items SET status = 'raw' WHERE id IN (SELECT id FROM content_items WHERE status IN ('processed', 'extracted') LIMIT 1)");

    const { runExtraction } = await import('../src/backend/workflows/extraction.js');
    // Run extraction
    await runExtraction(1);

    process.exit();
}

debugExtraction();
