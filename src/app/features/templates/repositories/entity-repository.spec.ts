import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EntityRepository } from './entity-repository';
import { MockHttpClient } from '@/core/services/mock-http-client';
import { Entity } from '../models/entity';
import { HttpApiResponse } from '@/core/models/http-api-response';
import { MessageService } from '@factor_ec/ui';

describe('EntityRepository', () => {
  let repository: EntityRepository;
  let mockHttpClient: Partial<MockHttpClient>;

  const mockEntity: Entity = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    company: 'Test Company',
    position: 'Developer',
    notes: 'Test notes',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  const mockApiResponse: HttpApiResponse<Entity> = {
    data: mockEntity,
    success: true
  };

  beforeEach(() => {
    // Arrange: Create mocks
    mockHttpClient = {
      post: vi.fn().mockReturnValue(of(mockApiResponse)),
      put: vi.fn().mockReturnValue(of(mockApiResponse)),
      delete: vi.fn().mockReturnValue(of(void 0)),
      get: vi.fn().mockReturnValue(of(mockEntity)),
      loadCollection: vi.fn()
    };

    const mockMessageService = {
      show: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        EntityRepository,
        { provide: MockHttpClient, useValue: mockHttpClient },
        { provide: MessageService, useValue: mockMessageService }
      ]
    });

    repository = TestBed.inject(EntityRepository);
  });

  describe('mutations', () => {
    it('should be callable', () => {
      // Arrange & Act & Assert
      expect(typeof repository.mutations).toBe('function');
    });
  });

  describe('find', () => {
    it('should be callable', () => {
      // Arrange & Act & Assert
      expect(typeof repository.find).toBe('function');
    });
  });

  describe('findBy', () => {
    it('should be callable', () => {
      // Arrange & Act & Assert
      expect(typeof repository.findBy).toBe('function');
    });
  });

  describe('constructor', () => {
    it('should load collection on initialization', () => {
      // Arrange & Act
      // Repository is created in beforeEach

      // Assert
      expect(mockHttpClient.loadCollection).toHaveBeenCalledWith('entities', expect.any(Array));
    });
  });
});
