import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { User } from '../models/user.model';

type UserMap = Record<string, User>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usersKey = 'users';
  private currentKey = 'current_user';

  private storage: StorageService;
  readonly currentUserSig = signal<User | null>(null);

  constructor(storage: StorageService) {
    this.storage = storage;

    const current = this.storage.get<string>(this.currentKey);
    const users = this.storage.get<UserMap>(this.usersKey) || {};
    this.currentUserSig.set(current ? users[current] ?? null : null);
  }

  // PUBLIC_INTERFACE
  /**
   * Register a new user.
   * @param email user email
   * @param password plain text password
   * @param displayName name to display
   * @throws Error if email already exists or invalid
   */
  register(email: string, password: string, displayName: string): User {
    email = email.trim().toLowerCase();
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    const users = this.storage.get<UserMap>(this.usersKey) || {};
    if (users[email]) {
      throw new Error('User already exists.');
    }
    const u: User = {
      id: this.uuid(),
      email,
      displayName: displayName?.trim() || email.split('@')[0],
      passwordHash: this.hash(password),
      createdAt: new Date().toISOString(),
    };
    users[email] = u;
    this.storage.set(this.usersKey, users);
    this.storage.set(this.currentKey, email);
    this.currentUserSig.set(u);
    return u;
  }

  // PUBLIC_INTERFACE
  /**
   * Log in with email and password.
   * @param email
   * @param password
   * @throws Error if invalid credentials
   */
  login(email: string, password: string): User {
    const users = this.storage.get<UserMap>(this.usersKey) || {};
    const u = users[email.trim().toLowerCase()];
    if (!u) throw new Error('User not found');
    if (u.passwordHash !== this.hash(password)) throw new Error('Invalid password');
    this.storage.set(this.currentKey, u.email);
    this.currentUserSig.set(u);
    return u;
  }

  // PUBLIC_INTERFACE
  /**
   * Log out current user.
   */
  logout(): void {
    this.storage.remove(this.currentKey);
    this.currentUserSig.set(null);
  }

  // PUBLIC_INTERFACE
  /**
   * Get current user synchronously.
   */
  getCurrentUser(): User | null {
    return this.currentUserSig();
  }

  private hash(s: string): string {
    // Simple non-cryptographic hash for demo purposes. Not for production use.
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return `h${h}`;
  }

  private uuid(): string {
    const g = (globalThis as any).crypto?.randomUUID?.();
    if (g) return g;
    // Fallback UUID-ish
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
