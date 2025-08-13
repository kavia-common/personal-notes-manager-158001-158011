import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.css'],
})
export class NoteEditorComponent {
  noteId = signal<string | null>(null);
  note = signal<Note | null>(null);

  form = new FormBuilder().group({
    title: ['', [Validators.required]],
    content: [''],
    tagsInput: [''], // comma separated
  });

  private route: ActivatedRoute;
  private router: Router;
  private notes: NotesService;

  constructor(route: ActivatedRoute, router: Router, notes: NotesService) {
    this.route = route;
    this.router = router;
    this.notes = notes;

    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      this.noteId.set(id);
      if (id) {
        const n = this.notes.getById(id) || null;
        this.note.set(n);
        if (n) {
          this.form.patchValue(
            {
              title: n.title,
              content: n.content,
              tagsInput: (n.tags || []).join(', '),
            },
            { emitEvent: false }
          );
        }
      } else {
        this.note.set(null);
        this.form.reset({ title: '', content: '', tagsInput: '' });
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const tags = (this.form.value.tagsInput || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    if (this.noteId()) {
      const updated = this.notes.update(this.noteId()!, {
        title: this.form.value.title!,
        content: this.form.value.content || '',
        tags,
      });
      if (updated) this.router.navigate(['/notes']);
    } else {
      const created = this.notes.create({
        title: this.form.value.title!,
        content: this.form.value.content || '',
        tags,
      });
      this.router.navigate(['/notes', created.id]);
    }
  }

  delete() {
    if (this.noteId() && (globalThis as any).confirm && (globalThis as any).confirm('Delete this note?')) {
      this.notes.delete(this.noteId()!);
      this.router.navigate(['/notes']);
    }
  }
}
