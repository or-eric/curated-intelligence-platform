import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    api = inject(ApiService);

    sources: any[] = [];
    loading = false;

    // Form State
    showForm = false;
    newSource = {
        name: '',
        url: '',
        tier: 'FREE',
        type: 'rss'
    };

    ngOnInit() {
        this.loadSources();
    }

    loadSources() {
        this.loading = true;
        this.api.getSources().subscribe({
            next: (data) => {
                this.sources = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load sources', err);
                this.loading = false;
            }
        });
    }

    addSource() {
        if (!this.newSource.name || !this.newSource.url) return;

        this.api.addSource(this.newSource).subscribe({
            next: () => {
                this.loadSources();
                this.showForm = false;
                this.newSource = { name: '', url: '', tier: 'FREE', type: 'rss' };
            },
            error: (err) => console.error('Failed to add source', err)
        });
    }

    deleteSource(id: number) {
        if (!confirm('Are you sure you want to delete this source?')) return;

        this.api.deleteSource(id).subscribe({
            next: () => this.loadSources(),
            error: (err) => console.error('Failed to delete source', err)
        });
    }
}
