import { inject, Injectable } from '@angular/core';
import { getApiUrl, getMutations, getResource } from '@/core/utils/async-repository';
import { MockHttpClient } from '@/core/services/mock-http-client';
import { BaseRepository } from '@/core/services/base-repository';
import { HttpApiResponse } from '@/core/models/http-api-response';
import { RecipeDTO, RecipeRequestCreate } from '../models/requirement.dto';
import { map, tap } from 'rxjs';

/**
 * Repository that encapsulates all data access for Recipes.
 *
 * @remarks
 * The class uses the shared async repository helpers to expose signals that
 * components can bind to without manually handling HTTP state.
 */
@Injectable({
  providedIn: 'root'
})
export class RecipeRepository extends BaseRepository {
  // TODO: Replace with real http client
  private readonly httpClient = inject(MockHttpClient);
  private readonly baseUrl = getApiUrl('v1/requirement-items');

  constructor() {
    super();
    // Mock data will be loaded in test setup
  }

  /**
   * Get all Recipes for a specific RequirementItem
   */
  public findByRequirementItem(requirementItemId: number) {
    return getResource<void, RecipeDTO[]>(() => {
      return this.httpClient
        .get<HttpApiResponse<RecipeDTO[]>>(`${this.baseUrl}/${requirementItemId}/recipes`)
        .pipe(map((response) => response.data || []));
    });
  }

  /**
   * Mutations for creating and deleting Recipes
   */
  public mutations() {
    return getMutations({
      create: (recipe: RecipeRequestCreate) => {
        const { requirementItemId, ...recipeData } = recipe;
        return this.httpClient
          .post<
            HttpApiResponse<RecipeDTO>
          >(`${this.baseUrl}/${requirementItemId}/recipes`, recipeData)
          .pipe(
            map((response) => response.data),
            tap((data) => this.notifyChange('create', [String(data?.id)]))
          );
      },
      delete: (requirementItemId: number, recipeId: number) => {
        return this.httpClient
          .delete<void>(`${this.baseUrl}/${requirementItemId}/recipes/${recipeId}`)
          .pipe(tap(() => this.notifyChange('delete', [String(recipeId)])));
      }
    });
  }
}
