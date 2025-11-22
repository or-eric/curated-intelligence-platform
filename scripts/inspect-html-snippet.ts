import fs from 'fs';

const html = fs.readFileSync('temp_google_blog.html', 'utf-8');
const index = html.indexOf('href="/products/nano-banana-pro/"');

if (index !== -1) {
    const start = Math.max(0, index - 500);
    const end = Math.min(html.length, index + 500);
    console.log(html.substring(start, end));
} else {
    console.log('String not found');
}
