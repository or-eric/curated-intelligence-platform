import * as dotenv from 'dotenv';
import * as path from 'path';

// Explicitly point to the .env file in the current directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Current Working Directory:', process.cwd());
console.log('Environment Variables Check:');
console.log('---------------------------');

const key = process.env.GEMINI_API_KEY;

if (!key) {
    console.error('❌ GEMINI_API_KEY is MISSING or undefined.');
} else {
    console.log('✅ GEMINI_API_KEY is FOUND.');
    console.log(`   Length: ${key.length}`);
    console.log(`   Starts with: ${key.substring(0, 5)}...`);

    if (key.startsWith('"') || key.endsWith('"')) {
        console.warn('⚠️  WARNING: Key appears to be wrapped in quotes. This might be the issue if not parsed correctly.');
    }
}

const dbUrl = process.env.POSTGRES_URL;
if (!dbUrl) {
    console.error('❌ POSTGRES_URL is MISSING.');
} else {
    console.log('✅ POSTGRES_URL is FOUND.');
}
