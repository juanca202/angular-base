import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleTagManagerService {
  appendTrackingCode(_code: string) {}
  push() {}
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  get(key: string, _scope?: 'local' | 'session') {
    return this.getItem(key);
  }
  set(key: string, value: any, _scope?: 'local' | 'session') {
    return this.setItem(key, value);
  }
  delete(key: string, _scope?: 'local' | 'session') {
    return this.removeItem(key);
  }
  getItem() {
    return null;
  }
  setItem(_k?: string, _v?: any) {}
  removeItem(_k?: string) {}
}
export class StringService {
  slugify(s: string) {
    return s;
  }
  normalizeName(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
export type Language = any;
export type Currency = any;
