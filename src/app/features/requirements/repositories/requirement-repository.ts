import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { getApiUrl, getResource } from '@/core/utils/async-repository';
import { MockHttpClient } from '@/core/services/mock-http-client';
import { BaseRepository } from '@/core/services/base-repository';
import { HttpApiResponse } from '@/core/models/http-api-response';
import { RequirementDTO, RequirementSearchParams } from '../models/requirement.dto';
import { map } from 'rxjs';

/**
 * Repository that encapsulates all data access for Requirements.
 *
 * @remarks
 * The class uses the shared async repository helpers to expose signals that
 * components can bind to without manually handling HTTP state.
 */
@Injectable({
  providedIn: 'root'
})
export class RequirementRepository extends BaseRepository {
  // TODO: Replace with real http client
  private readonly httpClient = inject(MockHttpClient);
  private readonly baseUrl = getApiUrl('v1/requirements');

  constructor() {
    super();
    // Mock data will be loaded in test setup
  }

  /**
   * List all Requirements with optional search parameters
   */
  public findBy() {
    return getResource<RequirementSearchParams | void, RequirementDTO[]>((searchParams?) => {
      let params = new HttpParams();
      if (searchParams) {
        if (searchParams.filters) {
          Object.entries(searchParams.filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              params = params.set(key, String(value));
            }
          });
        }
        if (searchParams.page) {
          params = params.set('page', String(searchParams.page));
        }
        if (searchParams.pageSize) {
          params = params.set('limit', String(searchParams.pageSize));
        }
      }
      return this.httpClient
        .get<HttpApiResponse<RequirementDTO[]>>(this.baseUrl, { params })
        .pipe(map((response) => response.data || []));
    });
  }

  /**
   * Get a single Requirement by ID, optionally including RequirementItems
   */
  public find() {
    return getResource<number, RequirementDTO>((id) => {
      const params = new HttpParams().set('includeItems', 'true');
      return this.httpClient
        .get<HttpApiResponse<RequirementDTO>>(`${this.baseUrl}/${id}`, { params })
        .pipe(map((response) => response.data));
    });
  }
}
