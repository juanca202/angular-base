import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Entity, EntityRequest } from '@/features/templates/models/entity';
import { getMutations, getResource, SignalGet } from '@/core/utils/async-repository';

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
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = '/mocks/entities.json';

  public mutations() {
    return getMutations({
      create: (Entity: EntityRequest) => this.httpClient.post<Entity>(`${this.baseUrl}`, Entity),
      update: (Entity: EntityRequest) => this.httpClient.put<Entity>(`${this.baseUrl}`, Entity)
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
