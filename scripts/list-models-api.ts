import * as dotenv from 'dotenv';
import * as path from 'path';

// Load production env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

async function listModelsApi() {
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
        console.error('No API key found');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            console.error(await response.text());
            return;
        }

        const data = await response.json();
        if (data.models) {
            console.log('Available Models:');
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods?.join(', ')})`);
            });
        } else {
            console.log('No models found in response');
        }
    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

listModelsApi();
