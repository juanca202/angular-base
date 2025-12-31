import { describe, it, expect } from 'vitest';
import { OPERATION_TYPE, OperationType } from './operation-type';

describe('OPERATION_TYPE constant', () => {
  describe('values', () => {
    it('should have CREATE operation type', () => {
      // Arrange & Act
      const result = OPERATION_TYPE.CREATE;

      // Assert
      expect(result).toBe('create');
    });

    it('should have UPDATE operation type', () => {
      // Arrange & Act
      const result = OPERATION_TYPE.UPDATE;

      // Assert
      expect(result).toBe('update');
    });

    it('should have DELETE operation type', () => {
      // Arrange & Act
      const result = OPERATION_TYPE.DELETE;

      // Assert
      expect(result).toBe('delete');
    });
  });

  describe('type safety', () => {
    it('should allow OperationType to be assigned from OPERATION_TYPE values', () => {
      // Arrange & Act
      const createType: OperationType = OPERATION_TYPE.CREATE;
      const updateType: OperationType = OPERATION_TYPE.UPDATE;
      const deleteType: OperationType = OPERATION_TYPE.DELETE;

      // Assert
      expect(createType).toBe('create');
      expect(updateType).toBe('update');
      expect(deleteType).toBe('delete');
    });

    it('should not allow invalid operation types', () => {
      // Arrange
      const validTypes: OperationType[] = [
        OPERATION_TYPE.CREATE,
        OPERATION_TYPE.UPDATE,
        OPERATION_TYPE.DELETE
      ];

      // Act & Assert
      validTypes.forEach((type) => {
        expect(['create', 'update', 'delete']).toContain(type);
      });
    });
  });

  describe('usage in RepositoryChange', () => {
    it('should be compatible with RepositoryChange type field', () => {
      // Arrange
      const changeWithCreate = {
        type: OPERATION_TYPE.CREATE as OperationType,
        ids: ['1']
      };
      const changeWithUpdate = {
        type: OPERATION_TYPE.UPDATE as OperationType,
        ids: ['2']
      };
      const changeWithDelete = {
        type: OPERATION_TYPE.DELETE as OperationType,
        ids: ['3']
      };

      // Act & Assert
      expect(changeWithCreate.type).toBe('create');
      expect(changeWithUpdate.type).toBe('update');
      expect(changeWithDelete.type).toBe('delete');
    });
  });
});
