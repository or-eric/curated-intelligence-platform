import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function checkModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('No API Key found in .env');
        return;
    }

    console.log(`Checking models with key: ${key.substring(0, 5)}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log('✅ Available Models:');
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                }
            });
        } else {
            console.error('❌ Failed to list models:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('❌ Network error:', e);
    }
}

checkModels();
