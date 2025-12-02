import express from 'express';
import { requireAuth } from '../middleware/auth';
import { ingestService } from '../services/ingest.service';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all feeds (Protected)
router.get('/', requireAuth, async (req, res) => {
    try {
        const feeds = await prisma.contentItem.findMany({
            orderBy: { publishedAt: 'desc' },
            take: 50,
            include: { source: true }
        });
        res.json(feeds);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch feeds' });
    }
});

// Trigger Ingestion (Admin only - simplified for now)
router.post('/ingest', requireAuth, async (req, res) => {
    try {
        // In a real app, check for ADMIN role here
        // if (req.user.role !== 'ADMIN') return res.status(403).send('Forbidden');

        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

        // Run in background (don't await)
        ingestService.runIngestion(limit).catch(err => console.error(err));

        res.json({ message: 'Ingestion started' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start ingestion' });
    }
});

export const feedRoutes = router;
