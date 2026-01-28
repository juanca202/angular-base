import { describe, it, expect } from 'vitest';
import { ACTION_TYPE } from './action-type';

describe('ACTION_TYPE', () => {
  it('should export action type constants', () => {
    // Arrange & Act & Assert
    expect(ACTION_TYPE).toBeDefined();
    expect(typeof ACTION_TYPE).toBe('object');
  });

  it('should have GROUP constant', () => {
    // Arrange & Act & Assert
    expect(ACTION_TYPE.GROUP).toBeDefined();
    expect(ACTION_TYPE.GROUP).toBe('group');
  });

  it('should have ITEM constant', () => {
    // Arrange & Act & Assert
    expect(ACTION_TYPE.ITEM).toBeDefined();
    expect(ACTION_TYPE.ITEM).toBe('item');
  });

  it('should have all expected action types', () => {
    // Arrange & Act
    const keys = Object.keys(ACTION_TYPE);

    // Assert
    expect(keys).toContain('GROUP');
    expect(keys).toContain('ITEM');
    expect(keys.length).toBe(2);
  });

  it('should have string values for all constants', () => {
    // Arrange & Act & Assert
    Object.values(ACTION_TYPE).forEach((value) => {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });
});
