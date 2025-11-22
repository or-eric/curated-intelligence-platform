import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function checkSources() {
    try {
        const result = await sql`
            SELECT f.name, COUNT(c.id) as count
            FROM content_items c
            JOIN feeds f ON c.source_id = f.id
            GROUP BY f.name
        `;
        if (result.rows.length === 0) {
            console.log('No content items found.');
        } else {
            console.log('Content count by source:');
            console.table(result.rows);
        }
    } catch (error) {
        console.error('Error checking sources:', error);
    }
}

checkSources();
