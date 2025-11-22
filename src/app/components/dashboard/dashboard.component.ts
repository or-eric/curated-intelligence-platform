import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { ContentItem } from '../../models/content-item.model';
import { ContentCardComponent } from '../content-card/content-card.component';
import { ContentListItemComponent } from '../content-list-item/content-list-item.component';
import { ObserveVisibilityDirective } from '../../directives/observe-visibility.directive';
import { LibraryService } from '../../services/library.service';

type TopicFilter = 'All' | 'Security' | 'Technology' | 'Humans';
type Layout = 'grid' | 'list';
type SortOption = 'Date' | 'Judgement' | 'Source';

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
  itemSelected = output<ContentItem>();

  public contentService = inject(ContentService);
  private libraryService = inject(LibraryService);
  private allContent = this.contentService.getContent();
  readonly initialItemCount = 6;

  // Filter and view state signals
  selectedTopic = signal<TopicFilter>('All');
  sortBy = signal<SortOption>('Date');
  layout = signal<Layout>('grid');
  minScore = signal<number>(0);
  visibleItemCount = signal<number>(this.initialItemCount);

  readonly topics: TopicFilter[] = ['All', 'Security', 'Technology', 'Humans'];
  readonly sortOptions: SortOption[] = ['Date', 'Judgement', 'Source'];

  filteredContent = computed(() => {
    const topic = this.selectedTopic();
    const sort = this.sortBy();
    const minScore = this.minScore();

    let items = this.allContent()
      .filter(item => topic === 'All' || item.category === topic)
      .filter(item => (item.totalScore || 0) >= minScore);

    // Sorting logic
    switch (sort) {
      case 'Judgement':
        items = items.sort((a, b) => JUDGEMENT_ORDER[b.advisoryJudgement] - JUDGEMENT_ORDER[a.advisoryJudgement]);
        break;
      case 'Source':
        items = items.sort((a, b) => a.source.localeCompare(b.source));
        break;
      case 'Date':
      default:
        items = items.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
        break;
    }

    return items;
  });

  currentPage = signal<number>(1);

  paginatedContent = computed(() => {
    // For server-side pagination, we show all filtered content
    // The "pagination" happens by appending to the list via loadMore
    return this.filteredContent();
  });

  selectTopic(topic: TopicFilter) {
    this.selectedTopic.set(topic);
    // We don't reset page here because we are filtering the *loaded* content.
    // Ideally, we should refetch from server with filter, but for now we filter client-side.
  }

  setSortBy(option: SortOption) {
    this.sortBy.set(option);
  }

  setLayout(layout: Layout) {
    this.layout.set(layout);
  }

  setMinScore(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.minScore.set(Number(value));
  }

  loadMore() {
    this.currentPage.update(p => p + 1);
    this.contentService.loadMore(this.currentPage());
  }

  onItemClicked(item: ContentItem) {
    this.itemSelected.emit(item);
  }

  toggleSave(id: string) {
    this.libraryService.toggleItem(id);
  }
}
