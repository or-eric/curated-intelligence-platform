import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryService } from '../../services/library.service';
import { ContentService } from '../../services/content.service';
import { ContentItem } from '../../models/content-item.model';
import { ContentCardComponent } from '../content-card/content-card.component';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, ContentCardComponent],
  templateUrl: './library.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryComponent {
  itemSelected = output<ContentItem>();
  
  private libraryService = inject(LibraryService);
  private contentService = inject(ContentService);

  private allContent = this.contentService.getContent();
  private savedIds = this.libraryService.getSavedItemIds();

  savedItems = computed(() => {
    const ids = this.savedIds();
    return this.allContent()
      .filter(item => ids.has(item.id))
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  });

  onItemClicked(item: ContentItem) {
    this.itemSelected.emit(item);
  }
}
