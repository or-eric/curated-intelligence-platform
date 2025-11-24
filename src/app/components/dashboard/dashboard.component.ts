import { ChangeDetectionStrategy, Component, computed, inject, output, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { ContentItem } from '../../models/content-item.model';
import { ContentCardComponent } from '../content-card/content-card.component';
import { ContentListItemComponent } from '../content-list-item/content-list-item.component';
import { ObserveVisibilityDirective } from '../../directives/observe-visibility.directive';
import { LibraryService } from '../../services/library.service';

type TopicFilter = 'All' | 'Security' | 'Technology' | 'Humans';
type Layout = 'grid' | 'list';
type SortOption = 'Newest' | 'Score' | 'Oldest';

const JUDGEMENT_ORDER: { [key in ContentItem['advisoryJudgement']]: number } = {
  'Critical - Act': 3,
  'Important - Monitor': 2,
  'Relevant - Track': 1,
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ContentCardComponent, ContentListItemComponent, ObserveVisibilityDirective],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {


  protected contentService = inject(ContentService);
  private router = inject(Router);

  // Constantse libraryService = inject(LibraryService);
  private libraryService = inject(LibraryService);
  private allContent = this.contentService.getContent();
  readonly initialItemCount = 6;

  // Filter and view state signals
  selectedDomains = signal<Set<string>>(new Set(['All']));
  sortBy = signal<SortOption>('Newest');
  layout = signal<Layout>('grid');
  qualityThreshold = signal<number>(0);
  visibleItemCount = signal<number>(this.initialItemCount);
  timeRange = signal<string>('all');

  readonly domains: string[] = [
    'All', 'AI', 'Books', 'Business', 'Creativity', 'Culture', 'Cybersecurity',
    'Ethics', 'Futurecast', 'Governance', 'Geopolitics', 'Innovation',
    'National Security', 'Philosophy', 'Productivity', 'Science', 'Society',
    'Technology', 'Writing'
  ];

  readonly sortOptions: SortOption[] = ['Newest', 'Score', 'Oldest'];
  readonly timeRanges: { label: string, value: string }[] = [
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: 'All', value: 'all' }
  ];

  filteredContent = computed(() => {
    const domains = this.selectedDomains();
    const sort = this.sortBy();
    const threshold = this.qualityThreshold();

    let items = this.allContent()
      .filter(item => {
        if (domains.has('All')) return true;
        // Check if item has ANY of the selected domains in its topics
        return item.topics?.some(topic => domains.has(topic)) || item.category && domains.has(item.category);
      })
      .filter(item => (item.totalScore || 0) >= threshold)
      .sort((a, b) => {
        switch (this.sortBy()) {
          case 'Newest':
            return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
          case 'Oldest':
            return new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime();
          case 'Score':
            return (b.totalScore || 0) - (a.totalScore || 0);
          default:
            return 0;
        }
      });

    return items;
  });

  currentPage = signal<number>(1);

  paginatedContent = computed(() => {
    return this.filteredContent();
  });

  setTimeRange(range: string) {
    this.timeRange.set(range);
    this.currentPage.set(1);
    this.contentService.refresh(range);
  }

  toggleDomain(domain: string) {
    this.selectedDomains.update(current => {
      const newSet = new Set(current);
      if (domain === 'All') {
        return new Set(['All']);
      }

      newSet.delete('All');
      if (newSet.has(domain)) {
        newSet.delete(domain);
      } else {
        newSet.add(domain);
      }

      if (newSet.size === 0) {
        return new Set(['All']);
      }
      return newSet;
    });
  }

  setSortBy(option: SortOption) {
    this.sortBy.set(option);
  }

  setLayout(layout: Layout) {
    this.layout.set(layout);
  }

  setQualityThreshold(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.qualityThreshold.set(Number(value));
  }

  getScoreBand(score: number): { label: string, class: string } {
    if (score >= 90) return { label: 'Top-tier', class: 'text-purple-400' };
    if (score >= 80) return { label: 'Strong', class: 'text-green-400' };
    if (score >= 60) return { label: 'Good', class: 'text-blue-400' };
    if (score >= 40) return { label: 'Skim', class: 'text-yellow-400' };
    return { label: 'Ignore', class: 'text-gray-400' };
  }

  loadMore() {
    this.currentPage.update(p => p + 1);
    this.contentService.loadMore(this.currentPage(), this.timeRange());
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.contentService.loading()) return;

    const threshold = 500;
    const position = window.scrollY + window.innerHeight;
    const height = document.body.scrollHeight;

    if (position > height - threshold) {
      this.loadMore();
    }
  }



  toggleTheme() {
    document.documentElement.classList.toggle('dark');
  }

  onItemClicked(item: ContentItem) {
    this.router.navigate(['/content', item.id]);
  }

  toggleSave(id: string) {
    this.libraryService.toggleItem(id);
  }
}
