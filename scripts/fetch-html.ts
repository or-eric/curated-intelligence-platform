import fs from 'fs';

async function fetchHtml() {
    const url = 'https://blog.google/';
    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const html = await response.text();
        fs.writeFileSync('temp_google_blog.html', html);
        console.log('Saved to temp_google_blog.html');
    } catch (err) {
        console.error('Error:', err);
    }
}

fetchHtml();
