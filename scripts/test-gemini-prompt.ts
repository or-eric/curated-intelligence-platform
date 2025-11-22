import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testPrompt() {
    const genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY'] || '');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const candidates = [
        {
            "title": "A $100 Million AI Super PAC Targeted New York Democrat Alex Bores. He Thinks It Backfired",
            "link": "https://www.wired.com/story/alex-bores-andreessen-horowitz-super-pac-ai-regulation-new-york/",
            "snippet": "Leading the Future said it will spend millions to keep Alex Bores out of Congress. It might be helping him instead.",
            "url": "https://www.wired.com/story/alex-bores-andreessen-horowitz-super-pac-ai-regulation-new-york/"
        },
        {
            "title": "The Pelvic Floor Is a Problem",
            "link": "https://www.wired.com/story/the-pelvic-floor-is-a-problem/",
            "snippet": "Everyone’s suddenly obsessed with the pelvic floor—physical therapists, MAHA influencers, me. Could this deeply misunderstood body part really be the seat of so much modern dysfunction?",
            "url": "https://www.wired.com/story/the-pelvic-floor-is-a-problem/"
        },
        {
            "title": "Google in Latin America",
            "link": "https://blog.google/around-the-globe/google-latin-america/",
            "snippet": "Google in Latin America",
            "url": "https://blog.google/around-the-globe/google-latin-america/"
        }
    ];

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
      
      Candidates: ${JSON.stringify(candidates)}
      
      Return a JSON array of objects with 'url' and 'selection_reason' for the selected stories.
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });
        console.log('Response:', result.response.text());
    } catch (error) {
        console.error('Error:', error);
    }
}

testPrompt();
