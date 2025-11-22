import { db } from '../src/backend/services/db.service.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function migrateFeeds() {
    console.log('Starting feed migration...');

    try {
        // 1. Create table
        console.log('Creating feeds table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS feeds (
                id SERIAL PRIMARY KEY,
                url TEXT UNIQUE NOT NULL,
                name TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 2. Insert initial data
        const initialFeeds = [
            { name: 'TechCrunch', url: 'https://feeds.feedburner.com/TechCrunch/' },
            { name: 'Wired', url: 'https://www.wired.com/feed/rss' }
        ];

        console.log('Inserting initial feeds...');
        for (const feed of initialFeeds) {
            await db.query(`
                INSERT INTO feeds (name, url)
                VALUES ($1, $2)
                ON CONFLICT (url) DO NOTHING;
            `, [feed.name, feed.url]);
        }

        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // Close the pool if needed, though for a script it might just exit
        // db.end(); 
    }
}

migrateFeeds();
