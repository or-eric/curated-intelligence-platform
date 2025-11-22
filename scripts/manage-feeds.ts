import { db } from '../src/backend/services/db.service.js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log('Usage: npx tsx scripts/manage-feeds.ts <command> [args]');
        console.log('Commands:');
        console.log('  list                  List all feeds');
        console.log('  add <name> <url> [type]      Add a new feed (type: RSS or WEB)');
        console.log('  remove <id>           Remove a feed by ID');
        process.exit(1);
    }

    try {
        switch (command) {
            case 'list':
                try {
                    const res = await db.query('SELECT * FROM feeds ORDER BY id');
                    console.table(res.rows.map(r => ({ id: r.id, name: r.name, url: r.url, type: r.type, active: r.is_active })));
                } catch (err) {
                    console.error('Error listing feeds:', err);
                }
                break;

            case 'add':
                const name = args[1];
                const url = args[2];
                const type = (args[3] || 'RSS').toUpperCase();

                if (!name || !url) {
                    console.log('Usage: npx tsx scripts/manage-feeds.ts add <name> <url> [type]');
                    process.exit(1);
                }

                if (type !== 'RSS' && type !== 'WEB') {
                    console.error('Error: Type must be either RSS or WEB');
                    process.exit(1);
                }

                try {
                    await db.query('INSERT INTO feeds (name, url, type, is_active) VALUES ($1, $2, $3, true)', [name, url, type]);
                    console.log(`Feed "${name}" added successfully as ${type}.`);
                } catch (err) {
                    console.error('Error adding feed:', err);
                }
                break;

            case 'remove':
                const id = args[1];
                if (!id) {
                    console.error('Error: ID is required');
                    process.exit(1);
                }
                try {
                    await db.query('DELETE FROM feeds WHERE id = $1', [id]);
                    console.log(`Removed feed with ID: ${id}`);
                } catch (err) {
                    console.error('Error removing feed:', err);
                }
                break;

            default:
                console.log(`Unknown command: ${command}`);
                process.exit(1);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
}

main();
