import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function listFeeds() {
    try {
        const result = await sql`SELECT * FROM feeds ORDER BY id ASC`;
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (error) {
        console.error('Error listing feeds:', error);
    }
}

listFeeds();
