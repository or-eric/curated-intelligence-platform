export type SourceCategory = 'Security' | 'Technology' | 'Humans' | 'General';

export interface Source {
  id: string; // uuid
  name: string; // e.g., 'The Hacker News'
  url: string; // The URL to the RSS feed
  category: SourceCategory;
  lastFetched: string | null; // ISO 8601 date
}
