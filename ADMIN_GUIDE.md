# Curated Intelligence Platform - Administrator Guide

This guide provides instructions for managing the Curated Intelligence Platform, including content ingestion, feed management, and deployment.

## 1. Content Ingestion (Manual Trigger)

Because the automated scheduler (Cron Job) is disabled on the Vercel Hobby plan, you must manually trigger the ingestion process to fetch and analyze new stories.

**Command:**
```bash
npx tsx scripts/test-ingest-prod.ts
```

**What this does:**
1.  Fetches the latest articles from all active RSS feeds.
2.  Uses Google Gemini to select "strategic" stories from the candidates.
3.  Performs a deep analysis on selected stories.
4.  Saves the results (including executive summaries and cover images) to the live database.

**When to run:**
Run this whenever you want to update the dashboard with fresh content (e.g., once a day or every few hours).

---

## 2. Feed Management

You can manage the list of RSS sources that the system monitors using the command-line tool.

### List All Feeds
View all currently active feeds and their IDs.
```bash
npx tsx scripts/manage-feeds.ts list
```

### Add a New Feed
Add a new RSS URL to the system.
```bash
npx tsx scripts/manage-feeds.ts add "https://example.com/rss" "Feed Name"
```
*Example:* `npx tsx scripts/manage-feeds.ts add "https://thehackernews.com/rss.xml" "The Hacker News"`

### Remove a Feed
Remove a feed by its ID (found using the `list` command).
```bash
npx tsx scripts/manage-feeds.ts remove <id>
```
*Example:* `npx tsx scripts/manage-feeds.ts remove 4`

---

## 3. Deployment

To publish code changes or updates to the live website.

**Command:**
```bash
npx vercel deploy --prod
```

---

## 4. Database Maintenance

### Reset Database (WARNING)
**Caution:** This will delete ALL content items from the database. Use this only if you want to start fresh.
```bash
npx tsx scripts/reset-db.ts
```

### Verify Content
Check the raw data stored in the database for debugging purposes.
```bash
npx tsx scripts/verify-db-content.ts
```

---

## 5. Environment Variables

The application relies on the following environment variables. These are managed in the Vercel Dashboard (Settings > Environment Variables) for production, and in `.env` for local development.

- `GEMINI_API_KEY`: API key for Google Gemini AI.
- `POSTGRES_URL`: Connection string for the Neon/Vercel Postgres database.
- `BLOB_READ_WRITE_TOKEN`: Token for Vercel Blob storage (if used).
