const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function test() {
    try {
        console.log('Attempting to connect...');
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Server Time:', res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error('Connection error:', err.message);
        if (err.code) console.error('Error Code:', err.code);
    }
}

test();
