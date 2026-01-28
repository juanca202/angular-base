import { describe, it, expect } from 'vitest';
import { ENTITY_CONTEXT } from './entity-context';

describe('ENTITY_CONTEXT', () => {
  it('should export entity context constants', () => {
    // Arrange & Act & Assert
    expect(ENTITY_CONTEXT).toBeDefined();
    expect(typeof ENTITY_CONTEXT).toBe('object');
  });

  it('should have FORM constant', () => {
    // Arrange & Act & Assert
    expect(ENTITY_CONTEXT.FORM).toBeDefined();
    expect(ENTITY_CONTEXT.FORM).toBe('form');
  });

  it('should have DETAIL constant', () => {
    // Arrange & Act & Assert
    expect(ENTITY_CONTEXT.DETAIL).toBeDefined();
    expect(ENTITY_CONTEXT.DETAIL).toBe('detail');
  });

  it('should have LIST constant', () => {
    // Arrange & Act & Assert
    expect(ENTITY_CONTEXT.LIST).toBeDefined();
    expect(ENTITY_CONTEXT.LIST).toBe('list');
  });

  it('should have SEARCH constant', () => {
    // Arrange & Act & Assert
    expect(ENTITY_CONTEXT.SEARCH).toBeDefined();
    expect(ENTITY_CONTEXT.SEARCH).toBe('search');
  });

  it('should have all expected entity contexts', () => {
    // Arrange & Act
    const keys = Object.keys(ENTITY_CONTEXT);

    // Assert
    expect(keys).toContain('FORM');
    expect(keys).toContain('DETAIL');
    expect(keys).toContain('LIST');
    expect(keys).toContain('SEARCH');
    expect(keys.length).toBe(4);
  });

  it('should have string values for all constants', () => {
    // Arrange & Act & Assert
    Object.values(ENTITY_CONTEXT).forEach((value) => {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });
});
