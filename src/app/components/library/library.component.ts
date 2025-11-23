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

  exportBoardPack() {
    const items = this.savedItems();
    if (items.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Board Intelligence Pack</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; }
          .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; }
          .header h1 { font-size: 24px; margin: 0; }
          .header p { color: #666; margin: 5px 0 0; }
          .item { margin-bottom: 50px; page-break-inside: avoid; border-bottom: 1px solid #eee; padding-bottom: 40px; }
          .meta { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
          .title { font-size: 22px; font-weight: bold; margin: 0 0 15px; line-height: 1.3; }
          .summary { font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px; }
          .highlight { background: #f0f7ff; border-left: 4px solid #0066cc; padding: 15px; margin-bottom: 20px; }
          .highlight h4 { margin: 0 0 5px; color: #0066cc; font-size: 12px; text-transform: uppercase; font-weight: bold; }
          .highlight p { margin: 0; font-style: italic; font-size: 15px; }
          .implications { background: #f9f9f9; padding: 20px; border-radius: 8px; }
          .implications h4 { margin: 0 0 10px; font-size: 14px; text-transform: uppercase; font-weight: bold; color: #444; }
          .implications ul { margin: 0; padding-left: 20px; }
          .implications li { margin-bottom: 8px; font-size: 14px; line-height: 1.5; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Board Intelligence Pack</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        ${items.map(item => `
          <div class="item">
            <div class="meta">
              ${item.source} • ${new Date(item.publishedDate).toLocaleDateString()} • Score: ${item.totalScore || 'N/A'}
            </div>
            <h2 class="title">${item.title}</h2>
            
            ${item.executiveSummary?.whyWeHighlightThis ? `
              <div class="highlight">
                <h4>Why it Matters</h4>
                <p>"${item.executiveSummary.whyWeHighlightThis}"</p>
              </div>
            ` : ''}

            <div class="summary">
              ${item.executiveSummary?.eventSummary || item.summary}
            </div>

            ${item.lessonsForCSuite ? `
              <div class="implications">
                <h4>Strategic Implications</h4>
                <ul>
                  ${item.lessonsForCSuite.bestPractices.map(bp => `
                    <li><strong>${bp.title}:</strong> ${bp.description}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `).join('')}
        <script>
          window.onload = () => { setTimeout(() => window.print(), 500); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
