import { Pool } from '@neondatabase/serverless';

export const db = new Pool({
    connectionString: process.env.POSTGRES_URL,
});
