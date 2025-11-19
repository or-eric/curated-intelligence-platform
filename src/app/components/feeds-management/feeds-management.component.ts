import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SourceService } from '../../services/source.service';
import { SourceCategory } from '../../models/source.model';

@Component({
  selector: 'app-feeds-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feeds-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedsManagementComponent {
  private sourceService = inject(SourceService);
  
  sources = this.sourceService.getSources();

  // Form state
  newSourceName = signal('');
  newSourceUrl = signal('');
  newSourceCategory = signal<SourceCategory>('General');

  readonly categories: SourceCategory[] = ['General', 'Security', 'Technology', 'Humans'];

  getCategoryColor(category: SourceCategory): string {
    switch (category) {
      case 'Security': return 'bg-red-500/20 text-red-300';
      case 'Technology': return 'bg-sky-500/20 text-sky-300';
      case 'Humans': return 'bg-indigo-500/20 text-indigo-300';
      case 'General': return 'bg-slate-500/20 text-slate-300';
      default: return 'bg-slate-600/50 text-slate-300';
    }
  }

  addSource() {
    const name = this.newSourceName().trim();
    const url = this.newSourceUrl().trim();
    const category = this.newSourceCategory();
    if (name && url) {
      this.sourceService.addSource(name, url, category);
      this.newSourceName.set('');
      this.newSourceUrl.set('');
      this.newSourceCategory.set('General');
    }
  }

  removeSource(id: string) {
    if (confirm('Are you sure you want to remove this source?')) {
      this.sourceService.removeSource(id);
    }
  }
}
