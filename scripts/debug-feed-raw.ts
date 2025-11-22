import fs from 'fs';
import path from 'path';

async function fetchRawFeed() {
    const url = 'https://bankingblog.accenture.com/tag/cybersecurity';
    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url);
        const text = await response.text();
        const filePath = path.resolve(process.cwd(), 'debug_accenture.xml');
        fs.writeFileSync(filePath, text);
        console.log(`Saved raw feed to ${filePath}`);

        // Find the unencoded <
        const lines = text.split('\n');
        lines.forEach((line, i) => {
            // Look for < that is NOT a tag start
            // A tag start is < followed by a letter, /, ?, or !
            const match = line.match(/<(?![a-z\/\?!])/i);
            if (match) {
                console.log(`Found potential unencoded < at line ${i + 1}:`);
                console.log(line.trim());
                console.log('---');
            }
        });

    } catch (err) {
        console.error('Error:', err);
    }
}

fetchRawFeed();
