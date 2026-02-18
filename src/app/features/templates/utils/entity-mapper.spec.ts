import { describe, it, expect } from 'vitest';
import { EntityMapper } from './entity-mapper';
import type { Entity, EntityInput } from '../models/entity';

describe('EntityMapper', () => {
  describe('mapEntityToInput', () => {
    it('should map entity to input with all fields', () => {
      const entity: Entity = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        company: 'Acme',
        position: 'Developer',
        notes: 'Some notes',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      const input = EntityMapper.mapEntityToInput(entity);

      expect(input).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        company: 'Acme',
        position: 'Developer',
        notes: 'Some notes'
      });
    });

    it('should use empty string for optional fields when undefined', () => {
      const entity: Entity = {
        id: '1',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '9876543210',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      const input = EntityMapper.mapEntityToInput(entity);

      expect(input.company).toBe('');
      expect(input.position).toBe('');
      expect(input.notes).toBe('');
    });
  });

  describe('mapInputToRequestCreate', () => {
    it('should map input to create request with timestamps', () => {
      const input: EntityInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        company: 'Acme',
        position: 'Developer',
        notes: 'Notes'
      };

      const request = EntityMapper.mapInputToRequestCreate(input);

      expect(request.firstName).toBe('John');
      expect(request.lastName).toBe('Doe');
      expect(request.email).toBe('john@example.com');
      expect(request.phone).toBe('1234567890');
      expect(request.company).toBe('Acme');
      expect(request.position).toBe('Developer');
      expect(request.notes).toBe('Notes');
      expect(request.createdAt).toBeDefined();
      expect(request.updatedAt).toBeDefined();
      expect(typeof request.createdAt).toBe('string');
      expect(typeof request.updatedAt).toBe('string');
    });

    it('should omit empty optional fields as undefined', () => {
      const input: EntityInput = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '9876543210',
        company: '',
        position: '',
        notes: ''
      };

      const request = EntityMapper.mapInputToRequestCreate(input);

      expect(request.company).toBeUndefined();
      expect(request.position).toBeUndefined();
      expect(request.notes).toBeUndefined();
    });
  });

  describe('mapInputToRequestUpdate', () => {
    it('should map input to update request with id', () => {
      const input: EntityInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        company: 'Acme',
        position: 'Developer',
        notes: 'Notes'
      };

      const request = EntityMapper.mapInputToRequestUpdate(input, 'entity-123');

      expect(request.id).toBe('entity-123');
      expect(request.firstName).toBe('John');
      expect(request.lastName).toBe('Doe');
      expect(request.email).toBe('john@example.com');
      expect(request.phone).toBe('1234567890');
      expect(request.company).toBe('Acme');
      expect(request.position).toBe('Developer');
      expect(request.notes).toBe('Notes');
    });

    it('should omit empty optional fields as undefined', () => {
      const input: EntityInput = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '9876543210',
        company: '',
        position: '',
        notes: ''
      };

      const request = EntityMapper.mapInputToRequestUpdate(input, 'entity-456');

      expect(request.id).toBe('entity-456');
      expect(request.company).toBeUndefined();
      expect(request.position).toBeUndefined();
      expect(request.notes).toBeUndefined();
    });
  });
});
