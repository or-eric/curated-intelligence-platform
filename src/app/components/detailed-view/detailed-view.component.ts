import { ChangeDetectionStrategy, Component, effect, inject, input, OnDestroy, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ContentItem } from '../../models/content-item.model';
import { LibraryService } from '../../services/library.service';


type Tab = 'executive' | 'lessons' | 'scoring';

@Component({
  selector: 'app-detailed-view',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './detailed-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailedViewComponent implements OnDestroy {
  contentItem = input.required<ContentItem>();
  closeModal = output<void>();

  private libraryService = inject(LibraryService);

  // Component State
  isSaved = signal(false);
  activeTab = signal<Tab>('executive');
  showCopiedTooltip = signal(false);
  private tooltipTimeout: any;

  // AI Generation State
  loadingAnalysis = signal<boolean>(false);
  analysisError = signal<string | null>(null);
  displayedItem = signal<ContentItem | null>(null);

  constructor() {
    effect(() => {
      const item = this.contentItem();
      this.displayedItem.set(item);
      this.activeTab.set('executive');
      this.isSaved.set(this.libraryService.isSaved(item.id));
      this.analysisError.set(null);
    });
  }

  ngOnDestroy() {
    clearTimeout(this.tooltipTimeout);
  }


  toggleSave() {
    const item = this.contentItem();
    this.libraryService.toggleItem(item.id);
    this.isSaved.set(this.libraryService.isSaved(item.id));
  }

  share() {
    clearTimeout(this.tooltipTimeout);
    const item = this.contentItem();
    const url = `${window.location.origin}${window.location.pathname}?shareId=${item.id}`;
    navigator.clipboard.writeText(url).then(() => {
      this.showCopiedTooltip.set(true);
      this.tooltipTimeout = setTimeout(() => {
        this.showCopiedTooltip.set(false);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

  getStakeholderColor(stakeholder: string): string {
    const colors: { [key: string]: string } = {
      'Civil Society': 'bg-green-500/20 text-green-300',
      'Enterprises': 'bg-sky-500/20 text-sky-300',
      'Global & Multilateral': 'bg-indigo-500/20 text-indigo-300',
      'Government': 'bg-red-500/20 text-red-300',
      'Technology': 'bg-amber-500/20 text-amber-300',
      'Workforce': 'bg-pink-500/20 text-pink-300',
    };
    return colors[stakeholder] || 'bg-slate-600/50 text-slate-300';
  }

  getTagColor(tag: string): string {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes('ciso') || lowerTag.includes('cro')) return 'bg-red-600 text-white';
    if (lowerTag.includes('caio') || lowerTag.includes('cto') || lowerTag.includes('cio')) return 'bg-orange-600 text-white';
    if (lowerTag.includes('clo')) return 'bg-yellow-600 text-black';
    if (lowerTag.includes('incident') || lowerTag.includes('restore')) return 'bg-rose-600 text-white';
    if (lowerTag.includes('evolve') || lowerTag.includes('monitor')) return 'bg-teal-500 text-white';
    return 'bg-slate-600 text-white';
  }

  getAdvisoryColor(judgement: ContentItem['advisoryJudgement']): string {
    if (judgement === 'Critical - Act') return 'bg-red-600 text-white';
    if (judgement === 'Important - Monitor') return 'bg-yellow-500 text-black';
    return 'bg-green-600 text-white';
  }

  getConfidenceColor(score: number): string {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  }

  close() {
    this.closeModal.emit();
  }
}
