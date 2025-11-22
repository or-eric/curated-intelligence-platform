import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    console.log(`Testing Gemini with Key: ${key ? key.substring(0, 5) + '...' : 'MISSING'}`);

    if (!key) {
        console.error('No API Key found');
        return;
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    try {
        console.log('Sending request...');
        const result = await model.generateContent("Explain how AI works in one sentence.");
        console.log('Response received:');
        console.log(result.response.text());
    } catch (error: any) {
        console.error('❌ Error calling Gemini API:');
        console.error('Status:', error.status);
        console.error('StatusText:', error.statusText);
        console.error('Message:', error.message);

        if (error.status === 403) {
            console.error('\nPossible 403 Causes:');
            console.error('1. API Key is invalid.');
            console.error('2. "Generative Language API" is not enabled in Google Cloud Console.');
            console.error('3. API Key has restrictions (e.g. IP address or API restrictions).');
            console.error('4. Billing is disabled (though Flash has a free tier).');
        }
    }
}

testGemini();
