import { describe, it, expect } from 'vitest';
import { OPERATION_TYPE } from './operation-type';

describe('OPERATION_TYPE', () => {
  it('should export operation type constants', () => {
    // Arrange & Act & Assert
    expect(OPERATION_TYPE).toBeDefined();
    expect(typeof OPERATION_TYPE).toBe('object');
  });

  it('should have CREATE constant', () => {
    // Arrange & Act & Assert
    expect(OPERATION_TYPE.CREATE).toBeDefined();
    expect(OPERATION_TYPE.CREATE).toBe('create');
  });

  it('should have UPDATE constant', () => {
    // Arrange & Act & Assert
    expect(OPERATION_TYPE.UPDATE).toBeDefined();
    expect(OPERATION_TYPE.UPDATE).toBe('update');
  });

  it('should have DELETE constant', () => {
    // Arrange & Act & Assert
    expect(OPERATION_TYPE.DELETE).toBeDefined();
    expect(OPERATION_TYPE.DELETE).toBe('delete');
  });

  it('should have all expected operation types', () => {
    // Arrange & Act
    const keys = Object.keys(OPERATION_TYPE);

    // Assert
    expect(keys).toContain('CREATE');
    expect(keys).toContain('UPDATE');
    expect(keys).toContain('DELETE');
    expect(keys.length).toBe(3);
  });

  it('should have string values for all constants', () => {
    // Arrange & Act & Assert
    Object.values(OPERATION_TYPE).forEach((value) => {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });
});
