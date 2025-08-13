import { Injectable, computed, effect, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Note } from '../models/note.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private notesKeyPrefix = 'notes:';
  private notesSig = signal<Note[]>([]);
  private storage: StorageService;
  private auth: AuthService;

  readonly notes = computed(() => this.notesSig());

  constructor(storage: StorageService, auth: AuthService) {
    this.storage = storage;
    this.auth = auth;

    // Load notes for current user and persist on change.
    effect(() => {
      const u = this.auth.currentUserSig();
      if (u?.email) {
        const list = this.storage.get<Note[]>(this.key(u.email)) || [];
        this.notesSig.set(list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')));
      } else {
        this.notesSig.set([]);
      }
    });
    effect(() => {
      const u = this.auth.currentUserSig();
      if (u?.email) {
        this.storage.set(this.key(u.email), this.notesSig());
      }
    });
  }

  private key(email: string) {
    return `${this.notesKeyPrefix}${email.toLowerCase()}`;
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new note.
   * @param partial Partial note fields
   */
  create(partial: Partial<Note> = {}): Note {
    const now = new Date().toISOString();
    const n: Note = {
      id: this.uuid(),
      title: partial.title?.trim() || 'Untitled',
      content: partial.content || '',
      tags: partial.tags?.map(t => t.trim()).filter(Boolean) || [],
      createdAt: now,
      updatedAt: now,
      archived: false,
    };
    this.notesSig.set([n, ...this.notesSig()]);
    return n;
  }

  // PUBLIC_INTERFACE
  /**
   * Update an existing note.
   * @param id Note ID
   * @param changes Fields to update
   */
  update(id: string, changes: Partial<Note>): Note | null {
    const list = this.notesSig().slice();
    const idx = list.findIndex(n => n.id === id);
    if (idx === -1) return null;
    const updated: Note = { ...list[idx], ...changes, tags: this.cleanTags(changes.tags ?? list[idx].tags), updatedAt: new Date().toISOString() };
    list[idx] = updated;
    this.notesSig.set(list);
    return updated;
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a note by ID.
   * @param id Note ID
   */
  delete(id: string): void {
    this.notesSig.set(this.notesSig().filter(n => n.id !== id));
  }

  // PUBLIC_INTERFACE
  /**
   * Get a note by ID.
   * @param id
   */
  getById(id: string): Note | undefined {
    return this.notesSig().find(n => n.id === id);
  }

  // PUBLIC_INTERFACE
  /**
   * Filter notes by search text and tags.
   * @param searchText Search text matched in title or content.
   * @param tags Tags that must be included (AND).
   */
  filter(searchText: string, tags: string[]): Note[] {
    const q = (searchText || '').trim().toLowerCase();
    const required = (tags || []).map(t => t.toLowerCase());
    return this.notesSig().filter(n => {
      const matchesQ = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
      const noteTags = (n.tags || []).map(t => t.toLowerCase());
      const matchesTags = required.length === 0 || required.every(t => noteTags.includes(t));
      return matchesQ && matchesTags && !n.archived;
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Get all unique tags across notes.
   */
  allTags(): string[] {
    const set = new Set<string>();
    this.notesSig().forEach(n => (n.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  private cleanTags(tags: string[]): string[] {
    return (tags || []).map(t => t.trim()).filter(Boolean);
  }

  private uuid(): string {
    const g = (globalThis as any).crypto?.randomUUID?.();
    if (g) return g;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
