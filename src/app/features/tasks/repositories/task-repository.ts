import { inject, Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import {
  Task,
  TaskRequestCreate,
  TaskRequestUpdate,
  TaskRequestUpdateStatus,
  TaskRequestDelete,
  TaskSearchParams
} from '../models/task';
import { getApiUrl, getMutations, getResource } from '@/core/utils/async-resources';
import { MockHttpClient } from '@/core/services/mock-http-client';
import { BaseRepository } from '@/core/services/base-repository';
import { HttpApiResponse } from '@/core/models/http-api-response';
import tasksMock from '@/test/mocks/repositories/tasks.json';

/**
 * Repository that encapsulates all data access required by the tasks feature.
 *
 * @remarks
 * The class uses the shared async repository helpers to expose signals that
 * components can bind to without manually handling HTTP state.
 * Uses MockHttpClient during development until the real API is available.
 */
@Injectable({
  providedIn: 'root'
})
export class TaskRepository extends BaseRepository {
  // TODO: Replace with real http client when API is available
  private readonly httpClient = inject(MockHttpClient);
  private readonly baseUrl = getApiUrl('tasks');

  constructor() {
    super();
    this.httpClient.loadCollection('tasks', tasksMock);
  }

  /**
   * Mutations (POST, PUT, PATCH, DELETE)
   */
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
      updateStatus: (request: TaskRequestUpdateStatus) =>
        this.httpClient
          .patch<
            HttpApiResponse<Task>
          >(`${this.baseUrl}/${request.id}/status`, { status: request.status })
          .pipe(
            map((response: HttpApiResponse<Task>) => response.data),
            tap(() => this.notifyChange('update', [request.id]))
          ),
      delete: (request: TaskRequestDelete) =>
        this.httpClient
          .delete<void>(`${this.baseUrl}/${request.id}`)
          .pipe(tap(() => this.notifyChange('delete', [request.id])))
    });
  }

  /**
   * Single resource (GET by ID)
   */
  public find() {
    return getResource<string, Task>((id: string) => {
      return this.httpClient.get<Task>(`${this.baseUrl}/${id}`);
    });
  }

  /**
   * Resource list (GET all or filtered by status)
   */
  public findBy() {
    return getResource<TaskSearchParams | undefined, Task[]>((searchParams?: TaskSearchParams) => {
      let params = new HttpParams();
      if (searchParams) {
        if (searchParams.status) {
          params = params.set('status', searchParams.status);
        }
        if (searchParams.sort) {
          params = params.set('sort', searchParams.sort);
        }
        if (searchParams.order) {
          params = params.set('order', searchParams.order);
        }
      }
      return this.httpClient.get<Task[]>(`${this.baseUrl}`, { params });
    });
  }
}
