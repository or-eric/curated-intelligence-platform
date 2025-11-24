import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ContentItem } from '../../models/content-item.model';
import { NgOptimizedImage } from '@angular/common';
import { LibraryService } from '../../services/library.service';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, DatePipe],
  templateUrl: './content-card.component.html',
  styles: [':host { display: block; height: 100%; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentCardComponent {
  item = input.required<ContentItem>();
  index = input<number>(0);
  layout = input<'grid' | 'list'>('grid');
  saveToggled = output<string>();

  private libraryService = inject(LibraryService);

  isSaved = computed(() => this.libraryService.isSaved(this.item().id));

  advisoryColor = computed(() => {
    const judgement = this.item().advisoryJudgement;
    if (judgement === 'Critical - Act') return 'bg-red-600 text-white';
    if (judgement === 'Important - Monitor') return 'bg-yellow-500 text-black';
    return 'bg-green-600 text-white';
  });

  readingTime = computed(() => {
    const words = (this.item().summary || '').split(/\s+/).length + (this.item().executiveSummary?.eventAnalysis || '').split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  });

  evidenceLabel = computed(() => {
    const score = this.item().evidenceQuality || 0;
    if (score >= 80) return 'High Evidence';
    if (score >= 50) return 'Moderate Evidence';
    return 'Low Evidence';
  });

  imageError = signal(false);

  onImageError() {
    this.imageError.set(true);
  }

  evidenceColor = computed(() => {
    const score = this.item().evidenceQuality || 0;
    if (score >= 80) return 'bg-green-900/30 text-green-300 border-green-800';
    if (score >= 50) return 'bg-yellow-900/30 text-yellow-300 border-yellow-800';
    return 'bg-red-900/30 text-red-300 border-red-800';
  });

  getTagColor(tag: string): string {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes('ciso') || lowerTag.includes('cro')) {
      return 'bg-red-500 text-white';
    }
    if (lowerTag.includes('caio') || lowerTag.includes('cto')) {
      return 'bg-orange-500 text-white';
    }
    if (lowerTag.includes('board')) {
      return 'bg-purple-600 text-white';
    }
    return 'bg-slate-600 text-white';
  }

  toggleSave(event: MouseEvent) {
    event.stopPropagation();
    this.saveToggled.emit(this.item().id);
  }
}
