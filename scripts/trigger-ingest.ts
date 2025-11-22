import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function triggerIngest() {
    // Use the production URL or local if testing
    const baseUrl = 'https://curated-intelligence-platform-hulf50k9w-obsidian-rowe-dev.vercel.app';
    const url = `${baseUrl}/api/ingest?limit=5`; // Increase limit slightly for manual trigger

    console.log(`Triggering ingestion at ${url}...`);

    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log('Response Status:', response.status);
        console.log('Response Text:', text.substring(0, 500)); // Log first 500 chars

        try {
            const data = JSON.parse(text);
            console.log('Ingestion Result:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Response was not JSON');
        }
    } catch (error) {
        console.error('Error triggering ingestion:', error);
    }
}

triggerIngest();
