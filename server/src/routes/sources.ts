import express from 'express';
import { requireAuth } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all sources
router.get('/', requireAuth, async (req, res) => {
    try {
        const sources = await prisma.source.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(sources);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sources' });
    }
});

// Add new source
router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, url, tier, type } = req.body;
        const source = await prisma.source.create({
            data: { name, url, tier, type }
        });
        res.json(source);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create source' });
    }
});

// Update source
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, tier, type } = req.body;
        const source = await prisma.source.update({
            where: { id: parseInt(id) },
            data: { name, url, tier, type }
        });
        res.json(source);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update source' });
    }
});

// Delete source
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.source.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Source deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete source' });
    }
});

export const sourceRoutes = router;
