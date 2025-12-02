import Parser from 'rss-parser';
import { PrismaClient } from '@prisma/client';
import { geminiService } from './gemini.service';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();
const parser = new Parser();

export const ingestService = {
    async runIngestion(limit: number = 5) {
        console.log('Starting ingestion...');
        const sources = await prisma.source.findMany();

        for (const source of sources) {
            console.log(`Processing source: ${source.name}`);
            try {
                const feed = await parser.parseURL(source.url);

                for (const item of feed.items.slice(0, limit)) {
                    if (!item.link || !item.title) continue;

                    // Check if exists
                    const existing = await prisma.contentItem.findUnique({
                        where: { url: item.link }
                    });

                    if (existing) {
                        console.log(`Skipping existing: ${item.title}`);
                        continue;
                    }

                    // Scrape Content (Simple fallback)
                    let content = item.contentSnippet || item.content || '';

                    // AI Analysis
                    console.log(`Analyzing: ${item.title}`);
                    const metadata = await geminiService.extractMetadata(content);
                    const scoreResult = await geminiService.scoreContent(content, metadata);

                    if (scoreResult.total_score < 40) {
                        console.log(`Skipping low score (${scoreResult.total_score}): ${item.title}`);
                        continue;
                    }

                    // Save to DB
                    await prisma.contentItem.create({
                        data: {
                            title: item.title,
                            url: item.link,
                            summary: item.contentSnippet || '',
                            content: content,
                            score: scoreResult.total_score,

                            // Granular Scores
                            insightDensity: scoreResult.insight_density,
                            conceptualDepth: scoreResult.conceptual_depth,
                            originality: scoreResult.originality,
                            evidenceScore: scoreResult.evidence_quality_score,
                            clarity: scoreResult.clarity,
                            alignment: scoreResult.alignment,
                            scoreBand: scoreResult.score_band,

                            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
                            sourceId: source.id
                        }
                    });
                    console.log(`Ingested: ${item.title} (Score: ${scoreResult.total_score})`);
                }
            } catch (error) {
                console.error(`Error processing ${source.name}:`, error);
            }
        }
        console.log('Ingestion complete.');
    }
};
