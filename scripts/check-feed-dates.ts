import Parser from 'rss-parser';

async function checkFeedDates() {
    const parser = new Parser();
    const url = 'https://bankingblog.accenture.com/tag/cybersecurity/feed';
    console.log(`Fetching ${url}...`);
    try {
        const feed = await parser.parseURL(url);
        console.log(`Feed Title: ${feed.title}`);
        console.log('Items:');
        feed.items.forEach(item => {
            console.log(`- ${item.title}`);
            console.log(`  Date: ${item.pubDate}`);
        });
    } catch (err) {
        console.error('Error:', err);
    }
}

checkFeedDates();
