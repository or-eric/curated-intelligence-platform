import { db } from '../src/backend/services/db.service.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
    try {
        console.log('Reading schema file...');
        const schemaPath = path.join(process.cwd(), 'src', 'backend', 'db', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        // Split by semicolon to handle multiple statements if needed, 
        // but for now we'll try executing as one block or split if simple split works.
        // @vercel/postgres sql template tag might expect a template string, 
        // but we can use the query method if exposed or just pass the string.
        // Actually sql`...` is a tag. To execute a raw string we might need a different approach 
        // or just use the client directly. 
        // Let's try passing it as a value, but that might be parameterized.
        // Better to use the client from @vercel/postgres.

        // Using db.query allows raw strings
        await db.query(schemaSql);

        console.log('Schema applied successfully!');
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

setupDatabase();
