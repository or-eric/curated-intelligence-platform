import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentItem } from '../../models/content-item.model';

@Component({
  selector: 'app-content-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentListItemComponent {
  item = input.required<ContentItem>();

  categoryClass = computed(() => {
    const category = this.item().category;
    switch (category) {
      case 'Security': return 'bg-red-400';
      case 'Technology': return 'bg-blue-400';
      case 'Humans': return 'bg-purple-400';
      default: return 'bg-slate-400';
    }
  });

  timeSince = computed(() => {
    const date = new Date(this.item().publishedDate);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "min";
    return Math.floor(seconds) + "s";
  });

  advisoryJudgementAbbr = computed(() => {
    const judgement = this.item().advisoryJudgement;
    switch (judgement) {
      case 'Critical - Act': return 'Act';
      case 'Important - Monitor': return 'Mon';
      case 'Relevant - Track': return 'Trk';
    }
  });

  advisoryJudgementColor = computed(() => {
    const judgement = this.item().advisoryJudgement;
    switch (judgement) {
      case 'Critical - Act': return 'bg-red-600 text-white';
      case 'Important - Monitor': return 'bg-yellow-500 text-black';
      case 'Relevant - Track': return 'bg-green-600 text-white';
      default: return 'bg-slate-700 text-slate-300';
    }
  });
}
