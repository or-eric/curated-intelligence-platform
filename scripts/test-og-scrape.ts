async function scrapeOgImage(url: string) {
    console.log(`Fetching HTML from ${url}...`);
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const html = await response.text();

        // Improved regex for og:image (handles single/double quotes, whitespace)
        const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
        const twitterMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);

        const match = ogMatch || twitterMatch;

        if (match) {
            console.log('Found Image:', match[1]);
        } else {
            console.log('No og:image found.');
            console.log('HTML Start:', html.substring(0, 500)); // Debug snippet
        }
    } catch (error) {
        console.error('Error fetching URL:', error);
    }
}

// Test with a recent TechCrunch article
scrapeOgImage('https://techcrunch.com/2023/12/06/google-launches-gemini-a-powerful-new-ai-model/');
