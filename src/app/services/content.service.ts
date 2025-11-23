import { Injectable, inject, computed } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private apiService = inject(ApiService);

  // Expose the signal from ApiService
  // We use a computed or just return the signal directly if we want read-only access
  // Dashboard expects a function getContent() that returns a signal

  // Expose signals directly to match previous API
  loading = this.apiService.isLoading;
  error = this.apiService.error;

  getContent() {
    return this.apiService.contentItems;
  }

  refresh(timeRange: string = 'all') {
    this.apiService.fetchContent(1, 20, timeRange);
  }

  loadMore(page: number, timeRange: string = 'all') {
    this.apiService.fetchContent(page, 20, timeRange);
  }
}
