import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { db } from '../src/backend/services/db.service';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function checkAllSources() {
    try {
        // 1. Read sources.json
        const sourcesPath = path.resolve(process.cwd(), 'sources.json');
        const sourcesData = await fs.readFile(sourcesPath, 'utf-8');
        const sourcesJson = JSON.parse(sourcesData);
        const sources = sourcesJson.sources;

        console.log(`\n=== Checking ${sources.length} Sources ===\n`);

        // 2. Get all counts from DB grouped by source and status
        const res = await db.query(`
      SELECT source, status, count(*) as count 
      FROM content_items 
      GROUP BY source, status
      ORDER BY source
    `);

        // 3. Process and display
        const dbStats = res.rows;

        // Create a map for easy lookup: source -> { status: count }
        const statsMap = new Map<string, Record<string, number>>();

        for (const row of dbStats) {
            if (!statsMap.has(row.source)) {
                statsMap.set(row.source, {});
            }
            statsMap.get(row.source)![row.status] = parseInt(row.count, 10);
        }

        // 4. Display Table
        console.log(pad('Source Name', 40) + pad('Type', 15) + pad('Raw', 8) + pad('Extracted', 12) + pad('Scored', 8) + pad('Processed', 12) + pad('Error', 8));
        console.log('-'.repeat(103));

        for (const source of sources) {
            const stats = statsMap.get(source.name) || {};
            const raw = stats['raw'] || 0;
            const extracted = stats['extracted'] || 0;
            const scored = stats['scored'] || 0;
            const processed = stats['processed'] || 0;
            const error = stats['error'] || 0;

            console.log(
                pad(source.name, 40) +
                pad(source.source_type, 15) +
                pad(raw.toString(), 8) +
                pad(extracted.toString(), 12) +
                pad(scored.toString(), 8) +
                pad(processed.toString(), 12) +
                pad(error.toString(), 8)
            );
        }

        console.log('\n');

    } catch (err) {
        console.error('Error checking sources:', err);
    } finally {
        await db.end();
    }
}

function pad(str: string | undefined, len: number): string {
    const s = str || 'Unknown';
    if (s.length > len) {
        return s.substring(0, len - 3) + '... ';
    }
    return s + ' '.repeat(len - s.length);
}

checkAllSources();
