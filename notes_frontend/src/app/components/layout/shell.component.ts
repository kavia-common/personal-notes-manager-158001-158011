import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css'],
})
export class ShellComponent {
  sidebarOpen = signal<boolean>(false);
  user = computed(() => this.auth.currentUserSig());

  private auth: AuthService;

  constructor(auth: AuthService) {
    this.auth = auth;
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  logout() {
    this.auth.logout();
  }
}
