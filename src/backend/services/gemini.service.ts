import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY'] || '');

const summarySchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        summary: { type: SchemaType.STRING },
        accountableEntity: { type: SchemaType.STRING },
        strategicImportance: { type: SchemaType.STRING, format: 'enum', enum: ["HIGH", "MEDIUM", "LOW"] }
    },
    required: ["summary", "accountableEntity", "strategicImportance"]
};

const analysisSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        executiveOwner: { type: SchemaType.STRING },
        risks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        bestPractices: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
    },
    required: ["executiveOwner", "risks", "bestPractices"]
};

export class GeminiService {
    private model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    async generateExecutiveSummary(content: string) {
        const prompt = `
      You are a strategic intelligence analyst.
      Analyze the following content and provide an executive summary.
      Identify the accountable entity and rate the strategic importance.
      
      Content: ${content}
    `;

        const result = await this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: summarySchema
            }
        });

        return JSON.parse(result.response.text());
    }

    async generateLessons(content: string, summaryContext: any) {
        const prompt = `
      You are a C-suite advisor.
      Based on the content and the summary below, identify the primary executive owner, potential risks, and best practices.
      
      Content: ${content}
      Summary Context: ${JSON.stringify(summaryContext)}
    `;

        const result = await this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema
            }
        });

        return JSON.parse(result.response.text());
    }
}
