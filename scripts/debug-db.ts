import 'dotenv/config';
import { db } from '../src/backend/services/db.service';

async function debug() {
  try {
    const res = await db.query('SELECT id, summary FROM content_items WHERE id = 76');
    console.log('Item 76 Summary:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await db.end();
  }
}

debug();
