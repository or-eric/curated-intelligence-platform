import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export class GeminiService {
    private model;

    constructor() {
        const genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY'] || '');
        this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    async selectStrategicStories(candidates: any[]) {
        const prompt = `
      You are the analysis and orchestration engine for the Obsidian Rowe Intelligence Platform.
      Your job is to select the most strategically relevant stories from the provided list.
      
      Priority Domains:
      - National AI policy and strategy
      - Enterprise security breaches and major cyber incidents
      - LLM and frontier model developments
      - Global tech and AI regulation
      - Fintech / digital assets where AI, cyber, or governance are central
      
      Discard:
      - Pure product PR with no strategic or risk implications
      - Very minor incidents with no broader lesson for leaders
      
      Candidates: ${JSON.stringify(candidates.map(c => ({
            title: c.title,
            snippet: c.snippet || c.title,
            url: c.link || c.url
        })))}
      
      Return a JSON array of objects with 'url' and 'selection_reason' for the selected stories.
    `;

        const result = await this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        return JSON.parse(result.response.text());
    }

    async generateRichAnalysis(content: string) {
        const prompt = `
      You are the foremost expert in AI, technology, risk management, and governance.
      Analyze the following content for C-suite leaders and senior government officials.
      
      Content: ${content.substring(0, 15000)}...
      
      Return a SINGLE JSON object (NOT an array) with the following structure:
      {
        "confidence_score": 0-100,
        "executive_summary_tab": {
            "title": "Rewrite title for executive impact",
            "accountable_entity": "Primary organization",
            "stakeholders": ["List", "of", "stakeholders"],
            "executive_summary": "High-level summary",
            "why_it_matters": "Strategic importance",
            "event_analysis": "Detailed analysis",
            "assessment": "Strategic assessment text",
            "source_url": "Original URL if found",
            "selection_reason": "Why this was selected"
        },
        "strategic_implications_tab": {
            "title": "Strategic Implications",
            "governance_owners": "Who is accountable",
            "accountable_entity_impact": "Impact description",
            "stakeholders_assurance_requirements": "Requirements description",
            "risks": "Risks description",
            "verified_assurance_best_practices": [
                { "label": "Recommendation Title", "text": "Recommendation Description" }
            ]
        },
        "cover_image": {
            "cover_image_prompt": "Visual prompt for image generation",
            "cover_image_alt_text": "Alt text description"
        }
      }
    `;

        const result = await this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const parsed = JSON.parse(result.response.text());
        return Array.isArray(parsed) ? parsed[0] : parsed;
    }

    async extractMetadata(content: string) {
        const prompt = `
            You are an expert content analyst. Extract the following metadata from the content.
            
            Content: ${content.substring(0, 10000)}...

            Return a JSON object with these exact keys:
            1. topics: List of strings from this EXACT list ONLY: ["AI", "Books", "Business", "Creativity", "Culture", "Cybersecurity", "Ethics", "Futurecast", "Governance", "Geopolitics", "Innovation", "National Security", "Philosophy", "Productivity", "Science", "Society", "Technology", "Writing"]. Select all that apply.
            2. category: ONE string from ["SECURITY", "TECHNOLOGY", "HUMANS", "IDEAS"].
            3. personas: List of C-Suite roles relevant to this content (e.g., ["CISO", "CAIO", "CEO", "CRO", "CTO"]).
            4. reading_time: Integer (minutes).
            5. complexity: String ["Low", "Medium", "High"].
            6. evidence_quality: String ["High", "Medium", "Low"].
            7. novelty: String ["High", "Medium", "Low"].
            8. bias_slant: String description.
            9. risk_sensitivity: String description.
        `;

        const result = await this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        return JSON.parse(result.response.text());
    }

    async scoreContent(content: string, metadata: any) {
        const prompt = `
            You are a critical editor. Rate this content on a 0-100 scale based on the following criteria.
            
            Content: ${content.substring(0, 5000)}...
            Metadata: ${JSON.stringify(metadata)}

            Criteria:
            1. Insight Density (Signal vs. fluff)
            2. Conceptual Depth
            3. Originality of message and framing
            4. Evidence and reasoning quality
            5. Clarity and structure
            6. Alignment with "what matters" (Strategic importance)

            Total Score: Average of the above.
            Score Band:
            0-40: Ignore
            40-60: Skim
            60-80: Good
            80-90: Strong
            90+: Top-tier
        `;

        const schema = {
            type: SchemaType.OBJECT,
            properties: {
                insight_density: { type: SchemaType.INTEGER },
                conceptual_depth: { type: SchemaType.INTEGER },
                originality: { type: SchemaType.INTEGER },
                evidence_quality_score: { type: SchemaType.INTEGER },
                clarity: { type: SchemaType.INTEGER },
                alignment: { type: SchemaType.INTEGER },
                total_score: { type: SchemaType.INTEGER },
                score_band: { type: SchemaType.STRING, enum: ["Ignore", "Skim", "Good", "Strong", "Top-tier"] }
            },
            required: ["insight_density", "conceptual_depth", "originality", "evidence_quality_score", "clarity", "alignment", "total_score", "score_band"]
        };

        const result = await this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        return JSON.parse(result.response.text());
    }
}

export const geminiService = new GeminiService();
