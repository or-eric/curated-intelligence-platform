import dotenv from 'dotenv';
import path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function testExtraction() {
    const { geminiService } = await import('../src/backend/services/gemini.service.js');

    const dummyText = `
        Artificial Intelligence is transforming the security landscape. 
        Recent attacks on critical infrastructure show that hackers are using LLMs to generate sophisticated phishing campaigns.
        However, defenders are also using AI to detect anomalies faster than ever.
        Policy makers in the EU are debating the AI Act to regulate high-risk applications.
    `;

    try {
        console.log('Testing Minimal Prompt...');
        const result = await geminiService['model'].generateContent('Hello, are you working?');
        console.log('Result:', result.response.text());
    } catch (error) {
        console.error('Error:', error);
    }
}

testExtraction();
