// Native fetch is available in Node 18+

const urls = [
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80'
];

async function checkUrls() {
    for (const url of urls) {
        try {
            const res = await fetch(url);
            console.log(`URL: ${url} - Status: ${res.status}`);
        } catch (err) {
            console.error(`URL: ${url} - Error:`, err);
        }
    }
}

checkUrls();
