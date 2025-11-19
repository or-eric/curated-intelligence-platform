import { Injectable, signal, inject } from '@angular/core';
import { ContentItem } from '../models/content-item.model';
import { ApiService } from '../backend/api.service';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private apiService = inject(ApiService);

  // Client-side state signals
  public loading = signal<boolean>(true);
  private allContent = signal<ContentItem[]>([]);
  
  constructor() {
    this.loadInitialContent();
  }

  private async loadInitialContent() {
    this.loading.set(true);
    try {
      const content = await this.apiService.fetchContent();
      this.allContent.set(content);
    } catch (error) {
      console.error("Failed to load content", error);
      // In a real app, you might set an error signal here
    } finally {
      this.loading.set(false);
    }
  }

  getContent() {
    return this.allContent.asReadonly();
  }
}
