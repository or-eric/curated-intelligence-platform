import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load env vars from root .env
dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 3000;

import { feedRoutes } from './routes/feeds';
import { sourceRoutes } from './routes/sources';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/feeds', feedRoutes);
app.use('/api/sources', sourceRoutes);

// Supabase Client (for Auth verification)
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
