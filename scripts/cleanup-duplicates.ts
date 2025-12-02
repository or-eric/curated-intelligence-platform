import dotenv from 'dotenv';
import path from 'path';
import { db } from '../src/backend/services/db.service.js';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function cleanupDuplicates() {
    console.log('=== STARTING DUPLICATE CLEANUP ===');

    try {
        // 1. Find duplicate titles
        const duplicatesQuery = `
            SELECT lower(title) as title_key, count(*) as count
            FROM content_items
            GROUP BY lower(title)
            HAVING count(*) > 1
        `;

        const duplicates = await db.query(duplicatesQuery);
        console.log(`Found ${duplicates.rows.length} titles with duplicates.`);

        let deletedCount = 0;

        for (const row of duplicates.rows) {
            const titleKey = row.title_key;

            // 2. Fetch all items for this title
            const itemsQuery = `
                SELECT id, title, total_score, published_at 
                FROM content_items 
                WHERE lower(title) = $1
                ORDER BY total_score DESC NULLS LAST, published_at DESC
            `;

            const items = await db.query(itemsQuery, [titleKey]);

            // 3. Keep the best one (first one due to sorting), delete the rest
            const bestItem = items.rows[0];
            const toDelete = items.rows.slice(1);

            console.log(`\nProcessing: "${bestItem.title}"`);
            console.log(`  - Keeping ID: ${bestItem.id} (Score: ${bestItem.total_score})`);

            for (const itemToDelete of toDelete) {
                console.log(`  - Deleting ID: ${itemToDelete.id} (Score: ${itemToDelete.total_score})`);
                await db.query('DELETE FROM content_items WHERE id = $1', [itemToDelete.id]);
                deletedCount++;
            }
        }

        console.log(`\n=== CLEANUP COMPLETE ===`);
        console.log(`Deleted ${deletedCount} duplicate items.`);

    } catch (error) {
        console.error('Cleanup Error:', error);
    } finally {
        await db.end();
    }
}

cleanupDuplicates();
