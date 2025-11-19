import { Injectable, signal, effect } from '@angular/core';

const LIBRARY_STORAGE_KEY = 'curated-intelligence-library';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private savedItemIds = signal<Set<string>>(new Set());

  constructor() {
    this.loadFromLocalStorage();
    effect(() => {
      this.saveToLocalStorage();
    });
  }

  getSavedItemIds() {
    return this.savedItemIds.asReadonly();
  }

  isSaved(id: string): boolean {
    return this.savedItemIds().has(id);
  }

  addItem(id: string) {
    this.savedItemIds.update(ids => {
      const newIds = new Set(ids);
      newIds.add(id);
      return newIds;
    });
  }

  removeItem(id: string) {
    this.savedItemIds.update(ids => {
      const newIds = new Set(ids);
      newIds.delete(id);
      return newIds;
    });
  }

  toggleItem(id: string) {
    if (this.isSaved(id)) {
      this.removeItem(id);
    } else {
      this.addItem(id);
    }
  }

  private loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(LIBRARY_STORAGE_KEY);
      if (saved) {
        this.savedItemIds.set(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.error('Could not load library from local storage', e);
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(Array.from(this.savedItemIds())));
    } catch (e) {
      console.error('Could not save library to local storage', e);
    }
  }
}
