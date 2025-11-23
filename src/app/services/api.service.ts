import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContentItem, ExecutiveSummary, LessonsForCSuite } from '../models/content-item.model';
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);

    // Signal to hold the content items
    contentItems = signal<ContentItem[]>([]);
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);

    constructor() {
        this.fetchContent();
    }

    fetchContent(page: number = 1, limit: number = 20, timeRange: string = 'all') {
        this.isLoading.set(true);
        this.error.set(null);

        this.http.get<any[]>(`/api/content?page=${page}&limit=${limit}&timeRange=${timeRange}`)
            .pipe(
                map(items => items.map(item => this.mapToContentItem(item)))
            )
            .subscribe({
                next: (newItems) => {
                    if (page === 1) {
                        this.contentItems.set(newItems);
                    } else {
                        this.contentItems.update(current => [...current, ...newItems]);
                    }
                    this.isLoading.set(false);
                },
                error: (err) => {
                    console.error('Error fetching content:', err);
                    this.error.set('Failed to load content. Please try again later.');
                    this.isLoading.set(false);
                }
            });
    }

    getItem(id: string) {
        return this.http.get<any[]>(`/api/content?id=${id}`)
            .pipe(
                map(items => items.length > 0 ? this.mapToContentItem(items[0]) : null)
            );
    }

    private mapToContentItem(backendItem: any): ContentItem {
        let summaryData = backendItem.summary || {};
        let analysisData = backendItem.analysis || {};

        if (typeof summaryData === 'string') {
            try { summaryData = JSON.parse(summaryData); } catch (e) { console.error('Failed to parse summary JSON', e); summaryData = {}; }
        }
        if (typeof analysisData === 'string') {
            try { analysisData = JSON.parse(analysisData); } catch (e) { console.error('Failed to parse analysis JSON', e); analysisData = {}; }
        }

        // 1. Advisory Judgement Logic
        // Parse "assessment" text for keywords or default to Relevant
        let judgement: ContentItem['advisoryJudgement'] = 'Relevant - Track';
        const assessmentLower = (summaryData.assessment || '').toLowerCase();
        if (assessmentLower.includes('high strategic importance') || assessmentLower.includes('critical')) {
            judgement = 'Critical - Act';
        } else if (assessmentLower.includes('moderate strategic importance') || assessmentLower.includes('important')) {
            judgement = 'Important - Monitor';
        }

        // 2. Construct Executive Summary object
        const execSummary: ExecutiveSummary = {
            accountableEntity: summaryData.accountable_entity || 'Unknown',
            stakeholders: summaryData.stakeholders || [],
            eventSummary: summaryData.executive_summary || 'No summary available.',
            whyWeHighlightThis: summaryData.why_it_matters || '',
            eventAnalysis: summaryData.event_analysis || '',
        };

        // 3. Construct Lessons object
        const lessons: LessonsForCSuite = {
            title: analysisData.title || 'Strategic Implications',
            primaryOwners: this.parseOwners(analysisData.governance_owners),
            supportingOwners: [], // Not explicitly in new schema, could parse from text if needed
            lifecycleStages: [], // Not explicitly in new schema
            accountableEntityImpact: analysisData.accountable_entity_impact || '',
            stakeholderRequirements: analysisData.stakeholders_assurance_requirements || '',
            risksWithoutAssurance: analysisData.risks || '',
            bestPractices: (analysisData.verified_assurance_best_practices || []).map((bp: any) => ({
                title: bp.label || 'Recommendation',
                description: bp.text || bp
            }))
        };

        // 4. Image Handling
        // Use curated images based on keywords if no specific image is available
        let imageUrl = backendItem.image_url || this.getRelevantImage(summaryData.title || backendItem.title, summaryData.accountable_entity);

        return {
            id: backendItem.id.toString(),
            title: summaryData.title || backendItem.title,
            source: this.safeGetHostname(summaryData.source_url || backendItem.url),
            category: backendItem.category || 'Technology', // Default to Technology if missing
            format: 'Article',
            publishedDate: summaryData.date || backendItem.published_at,
            url: summaryData.source_url || backendItem.url,
            summary: summaryData.executive_summary || 'No summary available.',
            imageUrl: imageUrl,
            imagePrompt: summaryData.cover_image?.cover_image_prompt,
            imageAlt: summaryData.cover_image?.cover_image_alt_text,
            tags: backendItem.tags || [], // Personas
            topics: backendItem.topics || [], // Domains
            advisoryJudgement: judgement,
            stakeholders: summaryData.stakeholders || [],
            executiveSummary: execSummary,
            lessonsForCSuite: lessons,
            selectionReason: summaryData.selection_reason,
            confidenceScore: summaryData.confidence_score,

            // New Scoring Fields
            scoreBand: backendItem.score_band,
            totalScore: backendItem.total_score,
            insightDensity: backendItem.insight_density,
            conceptualDepth: backendItem.conceptual_depth,
            originality: backendItem.originality,
            evidenceQuality: backendItem.evidence_score,
            clarity: backendItem.clarity,
            alignment: backendItem.alignment_score
        };
    }

    private parseOwners(owners: string | string[]): string[] {
        if (Array.isArray(owners)) return owners;
        if (!owners) return [];
        return owners.split(',').map(s => s.trim());
    }

    private getRelevantImage(title: string, entity: string): string {
        const text = (title + ' ' + (entity || '')).toLowerCase();

        // Curated Unsplash Images - Expanded Collection
        const images: Record<string, string[]> = {
            security: [
                'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80', // Matrix code
                'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80', // Lock/Security
                'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80', // Cyber lock
                'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80', // Dark code
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', // Hacker mask
                'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', // Cyber city
                'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80', // Code screen
                'https://images.unsplash.com/photo-1558494949-efc0257bb3af?auto=format&fit=crop&w=800&q=80', // Server room
                'https://images.unsplash.com/photo-1562813733-b31f71025d54?auto=format&fit=crop&w=800&q=80', // Security shield
                'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80'  // Digital tunnel
            ],
            ai: [
                'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80', // AI Brain
                'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80', // AI Abstract
                'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=800&q=80', // Robot hand
                'https://images.unsplash.com/photo-1655720828018-edd2daec9349?auto=format&fit=crop&w=800&q=80', // Neural network
                'https://images.unsplash.com/photo-1617791160505-6f00504e3519?auto=format&fit=crop&w=800&q=80', // AI Face
                'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=800&q=80', // Robot eye
                'https://images.unsplash.com/photo-1589254065878-42c9da9e2f58?auto=format&fit=crop&w=800&q=80', // Android
                'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80', // Cyborg
                'https://images.unsplash.com/photo-1535378437327-b7128d6e2d86?auto=format&fit=crop&w=800&q=80', // Circuit brain
                'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80'  // Data visualization
            ],
            business: [
                'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', // Skyscrapers
                'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', // Business people
                'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80', // Meeting
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', // Analytics
                'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', // Finance
                'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80', // Strategy
                'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80', // Office
                'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80', // CEO
                'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80', // Handshake
                'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=800&q=80'  // Money
            ],
            tech: [
                'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', // Chip
                'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', // Coding
                'https://images.unsplash.com/photo-1531297461136-82af7ce1ac0f?auto=format&fit=crop&w=800&q=80', // Laptop
                'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', // Network
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', // Retro tech
                'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80', // Laptop code
                'https://images.unsplash.com/photo-1504384308090-c54be3855463?auto=format&fit=crop&w=800&q=80', // Circuit board
                'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80', // Electronics
                'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=800&q=80', // Data
                'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=80'  // Server
            ]
        };

        if (text.includes('security') || text.includes('cyber') || text.includes('hack') || text.includes('breach') || text.includes('ciso')) {
            return this.pickRandom(images['security'], title);
        }
        if (text.includes('ai') || text.includes('intelligence') || text.includes('gpt') || text.includes('model') || text.includes('robot')) {
            return this.pickRandom(images['ai'], title);
        }
        if (text.includes('business') || text.includes('market') || text.includes('stock') || text.includes('ceo') || text.includes('money')) {
            return this.pickRandom(images['business'], title);
        }

        return this.pickRandom(images['tech'], title);
    }

    private safeGetHostname(url: string): string {
        if (!url) return 'Unknown Source';
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch (e) {
            return 'Unknown Source';
        }
    }

    private pickRandom(arr: string[], seed: string): string {
        // Deterministic hash function (DJB2)
        let hash = 5381;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) + hash) + seed.charCodeAt(i); /* hash * 33 + c */
        }
        // Ensure positive index
        const index = Math.abs(hash) % arr.length;
        return arr[index];
    }
}
