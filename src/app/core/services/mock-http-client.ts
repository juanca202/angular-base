import { environment } from '@/environments/environment';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

type MockEntity = Record<string, unknown> & { id?: string | number };
type QueryParams = Record<string, unknown>;
type RequestHeaders = Record<string, string>;

/** Handler para rutas custom que no son colecciones (auth, settings, etc.) */
type CustomRouteHandler = (url: string, body?: unknown) => Observable<unknown>;

@Injectable({
  providedIn: 'root'
})
export class MockHttpClient {
  /** In-memory mock database. Keys are collection names. */
  private db: Record<string, MockEntity[]> = {};

  /** Artificial latency (ms) added to all responses to simulate real network delay. */
  private readonly latency = 500;

  /** Rutas custom para auth, settings, etc. */
  private readonly customRoutes: Array<{
    method: 'GET' | 'POST';
    urlPattern: string | RegExp;
    handler: CustomRouteHandler;
  }> = [];

  /**
   * Registra un handler para una URL específica (usado para auth, settings, etc.).
   * La URL puede ser un string (coincide con includes) o un RegExp.
   *
   * @example
   * mockHttpClient.registerCustomRoute('POST', 'authentication_token', (url, body) =>
   *   of({ token: 'mock-jwt', refresh_token: 'mock-refresh' })
   * );
   */
  public registerCustomRoute(
    method: 'GET' | 'POST',
    urlPattern: string | RegExp,
    handler: CustomRouteHandler
  ): void {
    this.customRoutes.push({ method, urlPattern, handler });
  }

  /**
   * Busca un handler custom para la URL y método dados.
   */
  private findCustomHandler(method: 'GET' | 'POST', url: string): CustomRouteHandler | undefined {
    const route = this.customRoutes.find((r) => {
      if (r.method !== method) return false;
      if (typeof r.urlPattern === 'string') return url.includes(r.urlPattern);
      return r.urlPattern.test(url);
    });
    return route?.handler;
  }

  // ---------------------------------------------------------------------------
  // Initialization helpers
  // ---------------------------------------------------------------------------

  /**
   * Loads an initial dataset into memory.
   * This allows repositories to preload JSON files and simulate REST responses
   * without an actual backend.
   */
  public loadCollection(key: string, data: MockEntity[]): void {
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
   * Parses the URL and extracts the collection name, optional item ID, and optional subresource.
   *
   * Examples:
   *   "/mocks/contacts.json"           → { collection: "contacts", id: undefined, subresource: undefined }
   *   "/mocks/contacts/123.json"       → { collection: "123", id: "contacts", subresource: undefined } (not typical)
   *   "/contacts/123"                  → { collection: "contacts", id: "123", subresource: undefined }
   *   "/requirement-items/1/recipes"   → { collection: "requirement-items", id: "1", subresource: "recipes" }
   */
  private parseUrl(url: string): { collection: string; id?: string; subresource?: string } {
    const base = environment.apiRestBaseUrl.replace(/\/+$/, '');
    url = url.replace(base, '');

    const cleaned = url.replace(/^\/+|\/+$/g, '');
    const parts = cleaned.split('/');

    const collection = parts[0] || '';
    const id = parts[1];
    const subresource = parts[2];

    return { collection, id, subresource };
  }

  // ---------------------------------------------------------------------------
  // GET
  // ---------------------------------------------------------------------------

  /**
   * Simulates an HTTP GET request.
   * - If a subresource is present (e.g., /items/1/recipes), returns the subresource array from the item.
   * - If an ID is present in the URL, returns a single item.
   * - Otherwise returns the entire collection.
   */
  public get<T>(
    url: string,
    options?: { params?: HttpParams | QueryParams; headers?: RequestHeaders }
  ): Observable<T> {
    const customHandler = this.findCustomHandler('GET', url);
    if (customHandler) {
      return customHandler(url).pipe(delay(this.latency)) as Observable<unknown> as Observable<T>;
    }

    const { collection, id, subresource } = this.parseUrl(url);

    if (!this.db[collection]) {
      return throwError(() => new Error(`Collection '${collection}' not loaded`));
    }

    let data = structuredClone(this.db[collection]);

    // Handle subresources (e.g., /requirement-items/1/recipes)
    if (id && subresource) {
      const item = this.db[collection].find((x) => x.id == id);
      if (!item) {
        return throwError(
          () => new Error(`Item with id '${id}' not found in collection '${collection}'`)
        );
      }
      const subresourceData = this.getSubresourceItems(item, subresource);
      return of({ data: subresourceData } as unknown as T).pipe(delay(this.latency));
    }

    if (id) {
      const item = this.db[collection].find((x) => x.id == id);
      if (!item) {
        return throwError(
          () => new Error(`Item with id '${id}' not found in collection '${collection}'`)
        );
      }
      return of(structuredClone(item) as T).pipe(delay(this.latency));
    }

    const params = this.normalizeParams(options?.params);

    data = this.applyFilters(data, params);
    data = this.applyPagination(data, params);

    return of(data as unknown as T).pipe(delay(this.latency));
  }

  // ---------------------------------------------------------------------------
  // POST
  // ---------------------------------------------------------------------------

  /**
   * Simulates an HTTP POST request.
   * - If a subresource is present (e.g., /items/1/recipes), adds to the subresource array.
   * - Otherwise creates a new item in the collection.
   * - Automatically assigns a UUID as its ID.
   */
  public post<T>(url: string, body: unknown, _options?: unknown): Observable<T> {
    const customHandler = this.findCustomHandler('POST', url);
    if (customHandler) {
      return customHandler(url, body).pipe(
        delay(this.latency)
      ) as Observable<unknown> as Observable<T>;
    }

    const { collection, id, subresource } = this.parseUrl(url);

    // Handle subresources (e.g., POST /requirement-items/1/recipes)
    if (id && subresource) {
      const item = this.db[collection]?.find((x) => x.id == id);
      if (!item) {
        return throwError(
          () => new Error(`Item with id '${id}' not found in collection '${collection}'`)
        );
      }
      const subresourceItems = this.getSubresourceItems(item, subresource);
      const newSubItem: MockEntity = {
        id: crypto.randomUUID(),
        ...(typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {})
      };
      subresourceItems.unshift(newSubItem);
      item[subresource] = subresourceItems;
      return of({ data: structuredClone(newSubItem) } as unknown as T).pipe(delay(this.latency));
    }

    if (!this.db[collection]) this.db[collection] = [];

    const item: MockEntity = {
      id: crypto.randomUUID(),
      ...(typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {})
    };
    this.db[collection].unshift(item);

    return of(structuredClone(item) as T).pipe(delay(this.latency));
  }

  // ---------------------------------------------------------------------------
  // PUT
  // ---------------------------------------------------------------------------

  /**
   * Simulates an HTTP PUT request.
   * - Replaces an existing item.
   * - Throws an error if the ID is missing or not found.
   */
  public put<T>(url: string, body: unknown): Observable<T> {
    const { collection, id } = this.parseUrl(url);
    if (!id) return throwError(() => new Error('Missing id for PUT'));
    const index = this.db[collection]?.findIndex((x) => x.id == id);
    if (index === -1) return throwError(() => new Error('Item not found'));
    this.db[collection][index] = {
      ...this.db[collection][index],
      ...(typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {})
    };
    return of(structuredClone(this.db[collection][index]) as T).pipe(delay(this.latency));
  }

  // ---------------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------------

  /**
   * Simulates an HTTP DELETE request.
   * - If a subresource is present (e.g., /items/1/recipes/2), removes from the subresource array.
   * - Otherwise removes the item with the given ID from the collection.
   */
  public delete<T>(url: string): Observable<T> {
    const base = environment.apiRestBaseUrl.replace(/\/+$/, '');
    const cleanUrl = url.replace(base, '').replace(/^\/+|\/+$/g, '');
    const urlParts = cleanUrl.split('/');

    const collection = urlParts[0] || '';
    const id = urlParts[1];
    const subresource = urlParts[2];
    const subresourceId = urlParts[3];

    if (!id) return throwError(() => new Error('Missing id for DELETE'));

    // Handle subresources (e.g., DELETE /requirement-items/1/recipes/2)
    if (subresource && subresourceId) {
      const item = this.db[collection]?.find((x) => x.id == id);
      if (!item) {
        return throwError(
          () => new Error(`Item with id '${id}' not found in collection '${collection}'`)
        );
      }
      const subresourceItems = this.getSubresourceItems(item, subresource);
      item[subresource] = subresourceItems.filter((x) => String(x.id) != subresourceId);
      return of(true as T).pipe(delay(this.latency));
    }

    this.db[collection] = this.db[collection]?.filter((x) => x.id != id) ?? [];

    return of(true as T).pipe(delay(this.latency));
  }

  private getSubresourceItems(item: MockEntity, subresource: string): MockEntity[] {
    const value = item[subresource];
    if (Array.isArray(value)) {
      return value as MockEntity[];
    }
    const items: MockEntity[] = [];
    item[subresource] = items;
    return items;
  }

  private normalizeParams(params?: HttpParams | QueryParams): QueryParams {
    if (!params) return {};

    if (params instanceof HttpParams) {
      const result: QueryParams = {};
      params.keys().forEach((key) => {
        const values = params.getAll(key);
        result[key] = values && values.length > 1 ? values : values?.[0];
      });
      return result;
    }

    return params;
  }

  private applyFilters(data: MockEntity[], params: QueryParams): MockEntity[] {
    // Excluir parámetros de paginación del filtrado
    const { page, pageSize, ...filters } = params;

    let filteredData = data.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }
        return item[key] == value;
      })
    );

    // Aplicar paginación con page y pageSize
    if (pageSize && page) {
      const start = (Number(page) - 1) * Number(pageSize);
      filteredData = filteredData.slice(start, start + Number(pageSize));
    }

    return filteredData;
  }

  private applyPagination(data: MockEntity[], params: QueryParams): MockEntity[] {
    if (params['pageSize'] && params['page']) {
      const start = (Number(params['page']) - 1) * Number(params['pageSize']);
      return data.slice(start, start + Number(params['pageSize']));
    }

    if (params['limit']) {
      return data.slice(
        Number(params['offset'] ?? 0),
        Number(params['offset'] ?? 0) + Number(params['limit'])
      );
    }

    return data;
  }
}
