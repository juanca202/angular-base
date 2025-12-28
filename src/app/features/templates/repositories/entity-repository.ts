import { inject, Injectable } from '@angular/core';
import {
  Entity,
  EntityRequestCreate,
  EntityRequestUpdate,
  EntitySearchParams
} from '@/features/templates/models/entity';
import { getApiUrl, getMutations, getResource } from '@/core/utils/async-repository';
import { MockHttpClient } from '@/core/services/mock-http-client';
import repositoryMock from '@/test/mocks/repositories/entities.json';
import { map, tap } from 'rxjs/operators';
import { BaseRepository } from '@/core/services/base-repository';
import { HttpParams } from '@angular/common/http';
import { HttpApiResponse } from '@/core/models/http-api-response';

/**
 * Repository that encapsulates all data access required by the demo entity feature.
 *
 * @remarks
 * The class uses the shared async repository helpers to expose signals that
 * components can bind to without manually handling HTTP state.
 */
@Injectable({
  providedIn: 'root'
})
export class EntityRepository extends BaseRepository {
  // TODO: Replace with real http client
  private readonly httpClient = inject(MockHttpClient);
  private readonly baseUrl = getApiUrl('entities');

  constructor() {
    super();
    this.httpClient.loadCollection('entities', repositoryMock);
  }

  public mutations = getMutations({
    create: (entity: EntityRequestCreate) =>
      this.httpClient.post<HttpApiResponse<Entity>>(this.baseUrl, entity).pipe(
        map((response: HttpApiResponse<Entity>) => response.data),
        tap((data) => this.notifyChange('create', [data?.id]))
      ),
    update: (entity: EntityRequestUpdate) =>
      this.httpClient.put<HttpApiResponse<Entity>>(`${this.baseUrl}/${entity.id}`, entity).pipe(
        map((response: HttpApiResponse<Entity>) => response.data),
        tap(() => this.notifyChange('update', [entity.id]))
      ),
    delete: (id: string) =>
      this.httpClient
        .delete<void>(`${this.baseUrl}/${id}`)
        .pipe(tap(() => this.notifyChange('delete', [id])))
  });
  public find() {
    return getResource<string, Entity>((id) => {
      return this.httpClient.get<Entity>(`${this.baseUrl}/${id}`);
    });
  }
  public findBy() {
    return getResource<EntitySearchParams | undefined, Entity[]>((searchParams?) => {
      let params = new HttpParams();
      if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params = params.set(key, String(value));
          }
        });
      }
      return this.httpClient.get<Entity[]>(`${this.baseUrl}`, { params });
    });
  }
}
