import { db } from '../src/backend/services/db.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function countItems() {
    try {
        const res = await db.query('SELECT COUNT(*) FROM content_items');
        console.log('Total items in DB:', res.rows[0].count);

        const statusRes = await db.query('SELECT status, COUNT(*) FROM content_items GROUP BY status');
        console.log('Items by status:', statusRes.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

countItems();
