import { inject, Injectable } from '@angular/core';
import { Entity, EntityRequest } from '@/features/templates/models/entity';
import { getApiUrl, getMutations, getResource, SignalGet } from '@/core/utils/async-repository';
import { MockHttpClient } from '@/core/utils/mock-http-client';
import repositoryMock from '@/test/mocks/repositories/entities.json';
import { tap } from 'rxjs/operators';

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
export class EntityRepository {
  // TODO: Replace with real http client
  private readonly httpClient = inject(MockHttpClient);
  private readonly baseUrl = getApiUrl('entities');
  private readonly entity = getResource<string, Entity>((id: string) => {
    return this.httpClient.get<Entity>(`${this.baseUrl}/${id}`);
  });
  private readonly entities = getResource<void, Entity[]>(() => {
    return this.httpClient.get<Entity[]>(`${this.baseUrl}`);
  });

  constructor() {
    this.httpClient.loadCollection('entities', repositoryMock);
  }

  public mutations() {
    return getMutations({
      create: (entity: EntityRequest) =>
        this.httpClient.post<Entity>(this.baseUrl, entity).pipe(tap(() => this.entities.refresh())),
      update: (entity: EntityRequest) =>
        this.httpClient
          .put<Entity>(`${this.baseUrl}/${entity.id}`, entity)
          .pipe(tap(() => this.entities.refresh())),
      delete: (id: string) =>
        this.httpClient
          .delete<void>(`${this.baseUrl}/${id}`)
          .pipe(tap(() => this.entities.refresh()))
    });
  }
  public find(): SignalGet<string, Entity> {
    return this.entity;
  }
  public findBy(): SignalGet<void, Entity[]> {
    return this.entities;
  }
}
