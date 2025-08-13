import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css'],
})
export class NotesListComponent {
  qForm = new FormBuilder().group({
    q: [''],
  });
  selectedTags = signal<string[]>([]);
  allTags = computed(() => this.notesSvc.allTags());
  filteredNotes = computed(() => this.notesSvc.filter(this.qForm.value.q || '', this.selectedTags()));

  public notesSvc: NotesService;

  constructor(notesSvc: NotesService) {
    this.notesSvc = notesSvc;

    effect(() => {
      // Trigger recomputation when tags or form changes
      this.qForm.value;
      this.selectedTags();
    });
  }

  toggleTag(tag: string) {
    const set = new Set(this.selectedTags());
    if (set.has(tag)) set.delete(tag);
    else set.add(tag);
    this.selectedTags.set(Array.from(set));
  }

  trackById(_idx: number, n: Note) {
    return n.id;
  }

  deleteNote(id: string) {
    if ((globalThis as any).confirm && (globalThis as any).confirm('Delete this note?')) {
      this.notesSvc.delete(id);
    }
  }
}
