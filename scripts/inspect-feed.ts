import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['media:thumbnail', 'mediaThumbnail'],
            ['enclosure', 'enclosure'],
            ['content:encoded', 'contentEncoded']
        ]
    }
});

async function inspectFeed() {
    const urls = ['https://techcrunch.com/feed/', 'https://www.wired.com/feed/rss'];

    for (const url of urls) {
        console.log(`\nFetching ${url}...`);
        try {
            const feed = await parser.parseURL(url);
            console.log('Feed title:', feed.title);
            if (feed.items.length > 0) {
                const item = feed.items[0];
                console.log('--- First Item ---');
                console.log('Title:', item.title);
                console.log('Enclosure:', item.enclosure);
                console.log('Media Content:', item.mediaContent); // Note: rss-parser might map this to 'media:content' key in 'item' if not using customFields correctly or if it's namespaced

                // Check for image in content
                if (item.content) {
                    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch) {
                        console.log('Found Image in Content:', imgMatch[1]);
                    } else {
                        console.log('No image found in content start:', item.content.substring(0, 200));
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

inspectFeed();
