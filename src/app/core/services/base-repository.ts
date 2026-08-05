import { signal } from '@angular/core';
import { RepositoryChange } from '../models/repository-change';

/**
 * Base class for `{Entity}Repository` implementations (see ADR-010).
 *
 * @remarks
 * Tracks the most recent write (create/update/delete) performed by the repository as a
 * reactive signal, so callers (e.g. managers, other repositories) can react to changes in an
 * entity's collection without polling. Subclasses report writes by calling {@link notifyChange}
 * after a successful mutation.
 */
export abstract class BaseRepository {
  private readonly lastChange = signal<RepositoryChange | undefined>(undefined);

  /** The most recent change reported via {@link notifyChange}, or `undefined` if none yet. */
  public readonly change = this.lastChange.asReadonly();

  /**
   * Records a write performed by the repository, updating {@link change}.
   *
   * @param type - The kind of write that occurred.
   * @param ids - Identifiers of the affected entities.
   */
  protected notifyChange(type: RepositoryChange['type'], ids: string[]) {
    this.lastChange.set({
      type,
      ids
    });
  }
}
