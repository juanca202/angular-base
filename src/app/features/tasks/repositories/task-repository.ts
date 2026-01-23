import { inject, Injectable } from '@angular/core';
import { map, tap } from 'rxjs';

import {
  Task,
  TaskRequestCreate,
  TaskRequestUpdate,
  TaskSearchParams
} from '@/features/tasks/models/task';
import { getApiUrl, getMutations, getResource } from '@/core/utils/async-resources';
import { MockHttpClient } from '@/core/services/mock-http-client';
import { BaseRepository } from '@/core/services/base-repository';
import { HttpParams } from '@angular/common/http';
import { HttpApiResponse } from '@/core/models/http-api-response';
import repositoryMock from '@/test/mocks/repositories/tasks.json';

/**
 * Repository that encapsulates all data access required by the tasks feature.
 *
 * @remarks
 * The class uses the shared async repository helpers to expose signals that
 * components can bind to without manually handling HTTP state.
 */
@Injectable({
  providedIn: 'root'
})
export class TaskRepository extends BaseRepository {
  // TODO: Replace with real http client
  private readonly httpClient = inject(MockHttpClient);
  private readonly baseUrl = getApiUrl('tasks');

  constructor() {
    super();
    this.httpClient.loadCollection('tasks', repositoryMock);
  }

  public mutations() {
    return getMutations({
      create: (task: TaskRequestCreate) =>
        this.httpClient.post<HttpApiResponse<Task>>(this.baseUrl, task).pipe(
          map((response: HttpApiResponse<Task>) => response.data),
          tap((data) => this.notifyChange('create', [data?.id]))
        ),
      update: (task: TaskRequestUpdate) =>
        this.httpClient.put<HttpApiResponse<Task>>(`${this.baseUrl}/${task.id}`, task).pipe(
          map((response: HttpApiResponse<Task>) => response.data),
          tap(() => this.notifyChange('update', [task.id]))
        ),
      delete: (id: string) =>
        this.httpClient
          .delete<void>(`${this.baseUrl}/${id}`)
          .pipe(tap(() => this.notifyChange('delete', [id])))
    });
  }

  public find() {
    return getResource<string, Task>((id: string) => {
      return this.httpClient.get<Task>(`${this.baseUrl}/${id}`);
    });
  }

  public findBy() {
    return getResource<TaskSearchParams | undefined, Task[]>((searchParams?: TaskSearchParams) => {
      let params = new HttpParams();
      if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params = params.set(key, String(value));
          }
        });
      }
      return this.httpClient.get<Task[]>(`${this.baseUrl}`, { params });
    });
  }
}
