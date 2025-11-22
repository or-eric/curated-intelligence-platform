import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function resetDb() {
    console.log('Resetting database...');
    try {
        await db.query('TRUNCATE TABLE content_items RESTART IDENTITY CASCADE');
        console.log('Database reset successfully.');
    } catch (error) {
        console.error('Error resetting database:', error);
    } finally {
        await db.end();
    }
}

resetDb();
