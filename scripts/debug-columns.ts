import { db } from '../src/backend/services/db.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function checkColumns() {
    try {
        const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_items';
    `);
        console.log('Columns in content_items:', res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

checkColumns();
