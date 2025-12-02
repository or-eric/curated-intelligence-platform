import { PrismaClient, Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const sourcesPath = path.join(__dirname, '../../sources.json');
    const fileContent = fs.readFileSync(sourcesPath, 'utf-8');
    const config = JSON.parse(fileContent);

    console.log(`Seeding ${config.sources.length} sources...`);

    for (const source of config.sources) {
        await prisma.source.upsert({
            where: { url: source.url },
            update: {
                name: source.name,
                tier: source.tier === 'paid' ? Role.PAID : Role.FREE,
                type: source.ingest.method
            },
            create: {
                url: source.url,
                name: source.name,
                tier: source.tier === 'paid' ? Role.PAID : Role.FREE,
                type: source.ingest.method
            }
        });
    }
    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
