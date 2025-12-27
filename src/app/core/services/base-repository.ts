import { signal } from '@angular/core';
import { RepositoryChange } from '../models/repository-change';

export abstract class BaseRepository {
  private readonly lastChange = signal<RepositoryChange | undefined>(undefined);
  public readonly change = this.lastChange.asReadonly();

  protected notifyChange(type: RepositoryChange['type'], ids: string[]) {
    this.lastChange.set({
      type,
      ids
    });
  }
}
