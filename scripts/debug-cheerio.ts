import * as cheerio from 'cheerio';
import fs from 'fs';

const html = fs.readFileSync('temp_google_blog.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Empty links found:');
$('a').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();

    if (href && href.includes('nano-banana-pro')) {
        console.log(`--- Match ${i} ---`);
        console.log(`Href: ${href}`);
        console.log(`Text: "${text}"`);
        console.log(`Aria-Label: ${$(el).attr('aria-label')}`);
        console.log(`Title Attr: ${$(el).attr('title')}`);

        // Check siblings
        const siblingTitle = $(el).parent().find('.article__title, .feed-article__title').text().trim();
        console.log(`Sibling Title: "${siblingTitle}"`);
    }
});
