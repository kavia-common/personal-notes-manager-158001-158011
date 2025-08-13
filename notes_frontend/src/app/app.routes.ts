import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ShellComponent } from './components/layout/shell.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { NotesListComponent } from './components/notes/notes-list.component';
import { NoteEditorComponent } from './components/notes/note-editor.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => Promise.resolve(LoginComponent) },
  { path: 'register', loadComponent: () => Promise.resolve(RegisterComponent) },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'notes' },
      { path: 'notes', loadComponent: () => Promise.resolve(NotesListComponent) },
      { path: 'notes/new', loadComponent: () => Promise.resolve(NoteEditorComponent) },
      { path: 'notes/:id', loadComponent: () => Promise.resolve(NoteEditorComponent) },
      { path: 'settings', loadComponent: () => Promise.resolve(SettingsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
