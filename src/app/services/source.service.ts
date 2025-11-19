import { Injectable, signal, effect } from '@angular/core';
import { Source, SourceCategory } from '../models/source.model';

const SOURCE_STORAGE_KEY = 'curated-intelligence-sources';

const INITIAL_SOURCES: Source[] = [
  { id: '1', name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackerNews', category: 'Security', lastFetched: null },
  { id: '2', name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', category: 'Technology', lastFetched: null },
  { id: '3', name: 'Wired Top Stories', url: 'https://www.wired.com/feed/rss', category: 'General', lastFetched: null },
];

@Injectable({ providedIn: 'root' })
export class SourceService {
  private sources = signal<Source[]>([]);

  constructor() {
    this.loadFromLocalStorage();
    effect(() => {
      this.saveToLocalStorage();
    });
  }

  getSources() {
    return this.sources.asReadonly();
  }

  addSource(name: string, url: string, category: SourceCategory) {
    const newSource: Source = {
      id: self.crypto.randomUUID(),
      name,
      url,
      category,
      lastFetched: null,
    };
    this.sources.update(currentSources => [...currentSources, newSource]);
  }

  removeSource(id: string) {
    this.sources.update(currentSources => currentSources.filter(s => s.id !== id));
  }

  private loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(SOURCE_STORAGE_KEY);
      if (saved) {
        this.sources.set(JSON.parse(saved));
      } else {
        // Load initial data if nothing is saved
        this.sources.set(INITIAL_SOURCES);
      }
    } catch (e) {
      console.error('Could not load sources from local storage', e);
      this.sources.set(INITIAL_SOURCES);
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(SOURCE_STORAGE_KEY, JSON.stringify(this.sources()));
    } catch (e) {
      console.error('Could not save sources to local storage', e);
    }
  }
}
