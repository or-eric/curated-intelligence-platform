import { ChangeDetectionStrategy, Component, computed, inject, signal, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { ContentItem } from '../../models/content-item.model';

@Component({
    selector: 'app-briefing',
    standalone: true,
    imports: [CommonModule, DatePipe],
    templateUrl: './briefing.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BriefingComponent {
    private contentService = inject(ContentService);
    private router = inject(Router);

    // Get top 5 items from the last 24h
    briefingItems = this.contentService.getBriefingItems();

    currentIndex = signal(0);
    isFinished = signal(false);

    currentItem = computed(() => {
        const items = this.briefingItems();
        return items[this.currentIndex()];
    });

    progress = computed(() => {
        const total = this.briefingItems().length;
        if (total === 0) return 0;
        return ((this.currentIndex() + 1) / total) * 100;
    });

    next() {
        if (this.currentIndex() < this.briefingItems().length - 1) {
            this.currentIndex.update(i => i + 1);
        } else {
            this.isFinished.set(true);
        }
    }

    previous() {
        if (this.isFinished()) {
            this.isFinished.set(false);
        } else if (this.currentIndex() > 0) {
            this.currentIndex.update(i => i - 1);
        }
    }

    exit() {
        this.router.navigate(['/']);
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'ArrowRight') {
            this.next();
        } else if (event.key === 'ArrowLeft') {
            this.previous();
        } else if (event.key === 'Escape') {
            this.exit();
        }
    }
}
