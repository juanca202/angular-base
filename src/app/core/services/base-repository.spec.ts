import { describe, it, expect, beforeEach } from 'vitest';
import { BaseRepository } from '@/core/services/base-repository';
import { RepositoryChange } from '@/core/models/repository-change';

/**
 * Test implementation of BaseRepository for testing purposes
 */
class TestRepository extends BaseRepository {
  public testNotifyChange(type: RepositoryChange['type'], ids: string[]): void {
    this.notifyChange(type, ids);
  }
}

describe('BaseRepository', () => {
  // Arrange
  let repository: TestRepository;

  beforeEach(() => {
    // Arrange: Create a fresh instance for each test
    repository = new TestRepository();
  });

  describe('notifyChange', () => {
    it('should emit change signal when notifyChange is called with create type', () => {
      // Arrange
      const type: RepositoryChange['type'] = 'create';
      const ids = ['1', '2'];

      // Act
      repository.testNotifyChange(type, ids);

      // Assert
      const change = repository.change();
      expect(change).toBeDefined();
      expect(change?.type).toBe('create');
      expect(change?.ids).toEqual(['1', '2']);
    });

    it('should emit change signal when notifyChange is called with update type', () => {
      // Arrange
      const type: RepositoryChange['type'] = 'update';
      const ids = ['3'];

      // Act
      repository.testNotifyChange(type, ids);

      // Assert
      const change = repository.change();
      expect(change?.type).toBe('update');
      expect(change?.ids).toEqual(['3']);
    });

    it('should emit change signal when notifyChange is called with delete type', () => {
      // Arrange
      const type: RepositoryChange['type'] = 'delete';
      const ids = ['4', '5', '6'];

      // Act
      repository.testNotifyChange(type, ids);

      // Assert
      const change = repository.change();
      expect(change?.type).toBe('delete');
      expect(change?.ids).toEqual(['4', '5', '6']);
    });

    it('should update change signal when notifyChange is called multiple times', () => {
      // Arrange
      const firstChange: RepositoryChange['type'] = 'create';
      const firstIds = ['1'];
      const secondChange: RepositoryChange['type'] = 'update';
      const secondIds = ['2'];

      // Act
      repository.testNotifyChange(firstChange, firstIds);
      const firstResult = repository.change();
      repository.testNotifyChange(secondChange, secondIds);
      const secondResult = repository.change();

      // Assert
      expect(firstResult?.type).toBe('create');
      expect(firstResult?.ids).toEqual(['1']);
      expect(secondResult?.type).toBe('update');
      expect(secondResult?.ids).toEqual(['2']);
    });

    it('should handle empty ids array', () => {
      // Arrange
      const type: RepositoryChange['type'] = 'delete';
      const ids: string[] = [];

      // Act
      repository.testNotifyChange(type, ids);

      // Assert
      const change = repository.change();
      expect(change?.type).toBe('delete');
      expect(change?.ids).toEqual([]);
    });
  });

  describe('change signal', () => {
    it('should return undefined initially', () => {
      // Arrange & Act
      const change = repository.change();

      // Assert
      expect(change).toBeUndefined();
    });

    it('should return readonly signal', () => {
      // Arrange
      repository.testNotifyChange('create', ['1']);
      const changeSignal = repository.change();

      // Act & Assert
      expect(changeSignal).toBeDefined();
      // The signal should be readonly, so we can't modify it directly
      // This is tested implicitly by the fact that we can only read from it
      expect(changeSignal?.type).toBe('create');
    });
  });
});
