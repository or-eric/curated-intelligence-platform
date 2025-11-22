import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY'] || '');
    // Note: listModels is not directly on GoogleGenerativeAI instance in some versions, 
    // but let's try to use the model manager if available or just try a known model.
    // Actually, the SDK doesn't have a simple listModels method exposed on the top level easily in all versions.
    // Let's try to just run a simple generation with 'gemini-pro' to see if that works as a baseline.

    try {
        console.log('Testing gemini-1.5-flash...');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log('gemini-1.5-flash works!');
    } catch (e: any) {
        console.log('gemini-1.5-flash failed:', e.message);
    }

    try {
        console.log('Testing gemini-pro...');
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log('gemini-pro works!');
    } catch (e: any) {
        console.log('gemini-pro failed:', e.message);
    }
}

listModels();
