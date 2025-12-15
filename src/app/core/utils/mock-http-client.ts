import { environment } from '@/environments/environment';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MockHttpClient {
  /** In-memory mock database. Keys are collection names. */
  private db: Record<string, any[]> = {};

  /** Artificial latency (ms) added to all responses to simulate real network delay. */
  private readonly latency = 500;

  constructor() {}

  // ---------------------------------------------------------------------------
  // Initialization helpers
  // ---------------------------------------------------------------------------

  /**
   * Loads an initial dataset into memory.
   * This allows repositories to preload JSON files and simulate REST responses
   * without an actual backend.
   */
  public loadCollection(key: string, data: any[]) {
    this.db[key] = structuredClone(data);
  }

  /**
   * Extracts the collection name from a mock URL pointing to a JSON file.
   * Example:
   *   "/mocks/contacts.json" → "contacts"
   */
  private extractCollection(url: string): string {
    const parts = url.replace(/^\/+|\/+$/g, '').split('/');
    return parts[parts.length - 1].replace('.json', '');
  }

  /**
   * Parses the URL and extracts the collection name and optional item ID.
   *
   * Examples:
   *   "/mocks/contacts.json"     → { collection: "contacts", id: undefined }
   *   "/mocks/contacts/123.json" → { collection: "123", id: "contacts" } (not typical)
   *   "/contacts/123"            → { collection: "contacts", id: "123" }
   */
  private parseUrl(url: string): { collection: string; id?: string } {
    const base = environment.restEndpoint.replace(/\/+$/, '');
    url = url.replace(base, '');

    const cleaned = url.replace(/^\/+|\/+$/g, '');
    const parts = cleaned.split('/');

    const collection = parts[0] || '';
    const id = parts[1];

    return { collection, id };
  }

  // ---------------------------------------------------------------------------
  // GET
  // ---------------------------------------------------------------------------

  /**
   * Simulates an HTTP GET request.
   * - If an ID is present in the URL, returns a single item.
   * - Otherwise returns the entire collection.
   */
  public get<T>(url: string): Observable<T> {
    const { collection, id } = this.parseUrl(url);

    if (!this.db[collection])
      return throwError(() => new Error(`Collection '${collection}' not loaded`));

    if (id) {
      const item = this.db[collection].find((x) => x.id == id);
      return of(structuredClone(item)).pipe(delay(this.latency));
    }

    return of(structuredClone(this.db[collection]) as unknown as T).pipe(delay(this.latency));
  }

  // ---------------------------------------------------------------------------
  // POST
  // ---------------------------------------------------------------------------

  /**
   * Simulates an HTTP POST request.
   * - Creates a new item.
   * - Automatically assigns a UUID as its ID.
   */
  public post<T>(url: string, body: any): Observable<T> {
    const { collection } = this.parseUrl(url);

    if (!this.db[collection]) this.db[collection] = [];

    const item = { id: crypto.randomUUID(), ...body };
    this.db[collection].push(item);

    return of(structuredClone(item)).pipe(delay(this.latency));
  }

  // ---------------------------------------------------------------------------
  // PUT
  // ---------------------------------------------------------------------------

  /**
   * Simulates an HTTP PUT request.
   * - Replaces an existing item.
   * - Throws an error if the ID is missing or not found.
   */
  public put<T>(url: string, body: any): Observable<T> {
    const { collection, id } = this.parseUrl(url);

    if (!id) return throwError(() => new Error('Missing id for PUT'));

    const index = this.db[collection]?.findIndex((x) => x.id == id);

    if (index === -1) return throwError(() => new Error('Item not found'));

    this.db[collection][index] = { ...this.db[collection][index], ...body };

    return of(structuredClone(this.db[collection][index])).pipe(delay(this.latency));
  }

  // ---------------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------------

  /**
   * Simulates an HTTP DELETE request.
   * Removes the item with the given ID from the collection.
   */
  public delete<T>(url: string): Observable<T> {
    const { collection, id } = this.parseUrl(url);

    if (!id) return throwError(() => new Error('Missing id for DELETE'));

    this.db[collection] = this.db[collection]?.filter((x) => x.id != id) ?? [];

    return of(true as any).pipe(delay(this.latency));
  }
}
