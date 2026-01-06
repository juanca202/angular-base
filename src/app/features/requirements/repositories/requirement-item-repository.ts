import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { getApiUrl, getResource } from '@/core/utils/async-repository';
import { MockHttpClient } from '@/core/services/mock-http-client';
import { BaseRepository } from '@/core/services/base-repository';
import { HttpApiResponse } from '@/core/models/http-api-response';
import { RequirementItemDTO } from '../models/requirement.dto';
import { map } from 'rxjs';

/**
 * Repository that encapsulates all data access for RequirementItems.
 *
 * @remarks
 * The class uses the shared async repository helpers to expose signals that
 * components can bind to without manually handling HTTP state.
 */
@Injectable({
  providedIn: 'root'
})
export class RequirementItemRepository extends BaseRepository {
  // TODO: Replace with real http client
  private readonly httpClient = inject(MockHttpClient);
  private readonly baseUrl = getApiUrl('v1/requirement-items');

  constructor() {
    super();
    // Mock data will be loaded in test setup
  }

  /**
   * Get RequirementItems for a specific Requirement
   */
  public findByRequirement(requirementId: number) {
    return getResource<void, RequirementItemDTO[]>(() => {
      return this.httpClient
        .get<HttpApiResponse<RequirementItemDTO[]>>(`${this.baseUrl}`, {
          params: new HttpParams().set('requirementId', String(requirementId))
        })
        .pipe(map((response) => response.data || []));
    });
  }

  /**
   * Get a single RequirementItem by ID, optionally including Recipes
   */
  public find() {
    return getResource<number, RequirementItemDTO>((id) => {
      return this.httpClient
        .get<HttpApiResponse<RequirementItemDTO>>(`${this.baseUrl}/${id}`)
        .pipe(map((response) => response.data));
    });
  }
}
