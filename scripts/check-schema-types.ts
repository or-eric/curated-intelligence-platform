import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function checkTypes() {
    const res = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'content_items' 
        AND column_name IN ('summary', 'analysis');
    `);
    console.log(res.rows);
    process.exit();
}

checkTypes();
