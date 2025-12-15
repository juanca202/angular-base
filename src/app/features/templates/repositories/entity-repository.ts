import { inject, Injectable } from '@angular/core';
import { Entity, EntityRequest } from '@/features/templates/models/entity';
import { getApiUrl, getMutations, getResource, SignalGet } from '@/core/utils/async-repository';
import { MockHttpClient } from '@/core/utils/mock-http-client';
import repositoryMock from '@/test/mocks/repositories/entities.json';

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

  constructor() {
    this.httpClient.loadCollection('entities', repositoryMock);
  }

  public mutations() {
    return getMutations({
      create: (entity: EntityRequest) => this.httpClient.post<Entity>(this.baseUrl, entity),
      update: (entity: EntityRequest) =>
        this.httpClient.put<Entity>(`${this.baseUrl}/${entity.id}`, entity),
      delete: (id: string) => this.httpClient.delete<void>(`${this.baseUrl}/${id}`)
    });
  }
  public find(): SignalGet<string, Entity> {
    return getResource<string, Entity>((id: string) => {
      return this.httpClient.get<Entity>(`${this.baseUrl}/${id}`);
    });
  }
  public findBy(): SignalGet<void, Entity[]> {
    return getResource<void, Entity[]>(() => {
      return this.httpClient.get<Entity[]>(`${this.baseUrl}`);
    });
  }
}
