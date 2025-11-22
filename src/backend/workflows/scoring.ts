import { db } from '../services/db.service.js';
import { geminiService } from '../services/gemini.service.js';

export async function runScoring(limit: number = 5) {
    console.log('Starting Phase 3: Scoring & Rating...');
    const results = { processed: 0, errors: 0 };

    // Fetch extracted items
    const items = await db.query(`
        SELECT * FROM content_items 
        WHERE status = 'extracted' 
        LIMIT $1
    `, [limit]);

    console.log(`Found ${items.rows.length} extracted items to score.`);

    for (const item of items.rows) {
        try {
            console.log(`Scoring: ${item.title}`);

            // Construct metadata object for context
            const metadata = {
                topics: item.topics,
                category: item.category,
                complexity: item.complexity,
                evidence: item.evidence_quality
            };

            const scores = await geminiService.scoreContent(item.normalized_text || item.title, metadata);

            await db.query(`
                UPDATE content_items 
                SET 
                    insight_density = $1,
                    conceptual_depth = $2,
                    originality = $3,
                    evidence_score = $4,
                    clarity = $5,
                    alignment_score = $6,
                    total_score = $7,
                    score_band = $8,
                    status = 'processed'
                WHERE id = $9
            `, [
                scores.insight_density,
                scores.conceptual_depth,
                scores.originality,
                scores.evidence_quality_score,
                scores.clarity,
                scores.alignment,
                scores.total_score,
                scores.score_band,
                item.id
            ]);

            results.processed++;
            console.log(`Scored: ${item.title} (${scores.total_score} - ${scores.score_band})`);
        } catch (error) {
            console.error(`Error scoring ${item.title}:`, error);
            results.errors++;
        }
    }

    return results;
}
