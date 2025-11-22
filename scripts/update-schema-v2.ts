import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function updateSchema() {
    try {
        console.log('Updating schema for V2 Pipeline...');

        // Phase 1: Normalization
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'article'`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS author TEXT`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS normalized_text TEXT`;

        // Phase 2: Extraction
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS topics TEXT[]`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS category TEXT`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS reading_time INTEGER`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS complexity TEXT`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS evidence_quality TEXT`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS novelty TEXT`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS bias_slant TEXT`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS risk_sensitivity TEXT`;

        // Phase 3: Scoring
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS insight_density INTEGER`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS conceptual_depth INTEGER`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS originality INTEGER`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS evidence_score INTEGER`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS clarity INTEGER`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS alignment_score INTEGER`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS total_score INTEGER`;
        await sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS score_band TEXT`;

        console.log('Schema updated successfully.');
    } catch (error) {
        console.error('Error updating schema:', error);
    }
}

updateSchema();
