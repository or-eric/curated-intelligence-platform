import { db } from '../services/db.service.js';
import { geminiService } from '../services/gemini.service.js';

export async function runExtraction(limit: number = 5) {
    console.log('Starting Phase 2: Extraction & Categorization...');
    const results = { processed: 0, errors: 0 };

    // Fetch raw items
    const items = await db.query(`
        SELECT * FROM content_items 
        WHERE status = 'raw' 
        LIMIT $1
    `, [limit]);

    console.log(`Found ${items.rows.length} raw items to extract.`);

    for (const item of items.rows) {
        try {
            console.log(`Extracting metadata for: ${item.title}`);
            const metadata = await geminiService.extractMetadata(item.normalized_text || item.title);

            console.log(`Generating rich analysis for: ${item.title}`);
            const richAnalysis = await geminiService.generateRichAnalysis(item.normalized_text || item.title);
            console.log('Rich Analysis:', JSON.stringify(richAnalysis, null, 2));
            console.log('Rich Analysis Keys:', Object.keys(richAnalysis));
            if (!richAnalysis.executive_summary_tab) console.error('Missing executive_summary_tab');
            if (!richAnalysis.strategic_implications_tab) console.error('Missing strategic_implications_tab');

            await db.query(`
                UPDATE content_items 
                SET 
                    topics = $1,
                    category = $2,
                    reading_time = $3,
                    complexity = $4,
                    evidence_quality = $5,
                    novelty = $6,
                    bias_slant = $7,
                    risk_sensitivity = $8,
                    summary = $9,
                    analysis = $10,
                    tags = $11,
                    status = 'extracted'
                WHERE id = $12
            `, [
                metadata.topics,
                metadata.category,
                metadata.reading_time,
                metadata.complexity,
                metadata.evidence_quality,
                metadata.novelty,
                metadata.bias_slant,
                metadata.risk_sensitivity,
                richAnalysis.executive_summary_tab,
                richAnalysis.strategic_implications_tab,
                metadata.personas, // Save personas to tags column
                item.id
            ]);

            results.processed++;
            console.log(`Extracted: ${item.title}`);
        } catch (error) {
            console.error(`Error extracting ${item.title}:`, error);
            results.errors++;
        }
    }

    return results;
}
