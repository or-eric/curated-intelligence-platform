import { ChangeDetectionStrategy, Component, signal, effect, inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LibraryComponent } from './components/library/library.component';
import { ContentItem } from './models/content-item.model';
import { DetailedViewComponent } from './components/detailed-view/detailed-view.component';
import { FeedsManagementComponent } from './components/feeds-management/feeds-management.component';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, DashboardComponent, LibraryComponent, DetailedViewComponent, FeedsManagementComponent],
})
export class AppComponent implements OnInit {
  activeView = signal<'dashboard' | 'library' | 'feeds'>('dashboard');
  selectedContentItem = signal<ContentItem | null>(null);

  private document = inject(DOCUMENT);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  constructor() {
    effect(() => {
      // When the detailed view modal is open, prevent the body from scrolling.
      // When it's closed, restore scrolling.
      if (this.selectedContentItem()) {
        this.document.body.style.overflow = 'hidden';
      } else {
        this.document.body.style.overflow = '';
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const shareId = params['shareId'];
      if (shareId) {
        this.apiService.getItem(shareId).subscribe(item => {
          if (item) {
            this.selectedContentItem.set(item);
            // Optional: Clear the query param so refreshing doesn't reopen it? 
            // For now, keep it so the URL remains shareable.
          }
        });
      }
    });
  }

  setView(view: 'dashboard' | 'library' | 'feeds') {
    this.activeView.set(view);
  }

  showDetails(item: ContentItem) {
    this.selectedContentItem.set(item);
  }

  closeDetails() {
    this.selectedContentItem.set(null);
    // Optional: Clear query params on close
    window.history.replaceState({}, '', window.location.pathname);
  }
}
