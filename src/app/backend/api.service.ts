import { Injectable } from '@angular/core';
import { ContentItem } from '../models/content-item.model';
import { MOCK_DATA } from './database';

// This service simulates a backend API. In a real application, this would
// be a set of HTTP endpoints on a server (e.g., a Node.js/Express app).

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor() {}

  /**
   * Simulates fetching the curated content feed from the server.
   */
  async fetchContent(): Promise<ContentItem[]> {
    console.log('Backend API: Fetching content...');

    // --- REAL BACKEND LOGIC WOULD GO HERE ---
    // 1. INGESTION: A separate cron job or queue worker would be constantly
    //    pulling data from sources (RSS, APIs, scrapers), transcribing
    //    videos/podcasts, and adding new items to the database.
    //
    // 2. SCORING: As new items are ingested, they would be passed to the
    //    AI Scoring Engine (using Gemini) to generate the 6-dimension scores.
    //    The results would be saved back to the database.
    //
    // 3. FETCHING: This function would query the database for all content
    //    that is less than 7 days old and already scored.
    
    // We simulate network latency with a delay.
    await new Promise(resolve => setTimeout(resolve, 1200));

    console.log('Backend API: Content fetched successfully.');
    // Return a copy to prevent mutation of the "database"
    return [...MOCK_DATA];
  }
}
