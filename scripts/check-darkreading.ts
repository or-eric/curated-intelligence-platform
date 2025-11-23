import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { db } from '../src/backend/services/db.service';

async function checkDarkReading() {
    try {
        const res = await db.query(`
      SELECT status, count(*) 
      FROM content_items 
      WHERE source = 'Dark Reading' 
      GROUP BY status
    `);
        console.log('Dark Reading Status:', res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

checkDarkReading();
