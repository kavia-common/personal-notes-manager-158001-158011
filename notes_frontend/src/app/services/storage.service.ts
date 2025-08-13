import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private ns = 'pnm';

  // PUBLIC_INTERFACE
  /**
   * Get a value from localStorage under the app namespace.
   * @param key The key within the namespace.
   * @returns Parsed JSON or null.
   */
  get<T>(key: string): T | null {
    try {
      const ls: Storage | undefined = (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) || undefined;
      if (!ls) return null;
      const raw = ls.getItem(this.k(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Set a value in localStorage under the app namespace.
   * @param key The key within the namespace.
   * @param value The value to store (will be JSON stringified).
   */
  set<T>(key: string, value: T): void {
    const ls: Storage | undefined = (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) || undefined;
    if (!ls) return;
    ls.setItem(this.k(key), JSON.stringify(value));
  }

  // PUBLIC_INTERFACE
  /**
   * Remove a value from localStorage under the app namespace.
   * @param key The key within the namespace.
   */
  remove(key: string): void {
    const ls: Storage | undefined = (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) || undefined;
    if (!ls) return;
    ls.removeItem(this.k(key));
  }

  private k(key: string): string {
    return `${this.ns}:${key}`;
  }
}
