
import 'dotenv/config';
import { db } from '../src/backend/services/db.service';

async function debug() {
  try {
    console.log('--- Inspecting YouTube Items ---');
    const youtubeItems = await db.query(`
      SELECT id, title, source_id, url, analysis, summary 
      FROM content_items 
      WHERE url LIKE '%youtube.com%' OR url LIKE '%youtu.be%'
      LIMIT 5
    `);
    console.log(youtubeItems.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await db.end();
  }
}

debug();
