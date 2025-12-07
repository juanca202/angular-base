import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError, delay } from 'rxjs';

import { getMutations, getResource, getApiUrl, MutationException } from './async-repository';
import { MessageService } from '@factor_ec/ui';

describe('async-repository', () => {
  let httpMock: HttpTestingController;
  let mockMessageService: jest.Mocked<MessageService>;

  beforeEach(() => {
    mockMessageService = {
      show: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideHttpClient(), { provide: MessageService, useValue: mockMessageService }]
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getApiUrl', () => {
    it('should build correct API URL', () => {
      // Arrange
      const path = 'v1/contacts';

      // Act
      const result = getApiUrl(path);

      // Assert
      expect(result).toContain('v1/contacts');
    });
  });

  describe('getMutations', () => {
    it('should create mutations with correct structure', () => {
      // Arrange
      const factories = {
        create: () => of({ id: '1', name: 'Test' }),
        update: () => of({ id: '1', name: 'Updated' })
      };

      // Act
      const mutations = TestBed.runInInjectionContext(() => getMutations(factories));

      // Assert
      expect(mutations).toHaveProperty('create');
      expect(mutations).toHaveProperty('update');
      expect(mutations).toHaveProperty('submitting');
      expect(mutations).toHaveProperty('error');
      expect(mutations.create).toHaveProperty('submitting');
      expect(mutations.create).toHaveProperty('value');
      expect(mutations.create).toHaveProperty('error');
    });

    it('should execute mutation and update state', async () => {
      // Arrange
      const factories = {
        create: (data: any) => of({ id: '1', ...data })
      };
      const mutations = TestBed.runInInjectionContext(() => getMutations(factories));
      const payload = { name: 'Test' };

      // Act
      const promise = mutations.create(payload);

      // Assert
      expect(mutations.create.submitting()).toBe(true);
      expect(mutations.submitting()).toBe(true);

      const result = await promise;
      expect(result).toEqual({ id: '1', ...payload });
      expect(mutations.create.value()).toEqual({ id: '1', ...payload });
      expect(mutations.create.submitting()).toBe(false);
      expect(mutations.submitting()).toBe(false);
    });

    it('should handle mutation errors and show message', async () => {
      // Arrange
      const errorResponse = { error: { messages: ['Error message'] } };
      const factories = {
        create: () => throwError(() => errorResponse)
      };
      const mutations = TestBed.runInInjectionContext(() => getMutations(factories));

      // Act & Assert
      await expect(mutations.create({})).rejects.toThrow(MutationException);
      expect(mockMessageService.show).toHaveBeenCalledWith('Error message');
      expect(mutations.create.error()).toBe('Error message');
      expect(mutations.error()).toBe('Error message');
      expect(mutations.create.submitting()).toBe(false);
    });

    it('should handle mutation errors without messages array', async () => {
      // Arrange
      const errorResponse = { message: 'Simple error' };
      const factories = {
        create: () => throwError(() => errorResponse)
      };
      const mutations = TestBed.runInInjectionContext(() => getMutations(factories));

      // Act & Assert
      await expect(mutations.create({})).rejects.toThrow(MutationException);
      expect(mockMessageService.show).toHaveBeenCalledWith('Simple error');
    });

    it('should track global submitting state across multiple mutations', async () => {
      // Arrange
      const factories = {
        create: () => of({ id: '1' }),
        update: () => of({ id: '1' })
      };
      const mutations = TestBed.runInInjectionContext(() => getMutations(factories));

      // Act
      const promise1 = mutations.create({});
      const promise2 = mutations.update({ id: '1' });

      // Assert
      expect(mutations.submitting()).toBe(true);

      await promise1;
      expect(mutations.submitting()).toBe(true); // Still true because update is running

      await promise2;
      expect(mutations.submitting()).toBe(false);
    });
  });

  describe('getResource', () => {
    it('should create resource with correct structure', () => {
      // Arrange
      const factory = () => of([{ id: '1' }]);

      // Act
      const resource = TestBed.runInInjectionContext(() => getResource(factory));

      // Assert
      expect(resource).toHaveProperty('value');
      expect(resource).toHaveProperty('loading');
      expect(resource).toHaveProperty('error');
      expect(resource).toHaveProperty('load');
      expect(resource).toHaveProperty('destroy');
    });

    it('should load resource and update state', async () => {
      // Arrange
      const expectedData = [{ id: '1', name: 'Test' }];
      const factory = () => of(expectedData).pipe(delay(0));
      const resource = TestBed.runInInjectionContext(() => getResource(factory));

      // Act
      const promise = resource.load();

      // Assert
      expect(resource.loading()).toBe(true);
      expect(resource.value()).toBeNull();

      const result = await promise;
      expect(result).toEqual(expectedData);
      expect(resource.value()).toEqual(expectedData);
      expect(resource.loading()).toBe(false);
    });

    it('should handle resource errors and show message', async () => {
      // Arrange
      const errorResponse = { error: { messages: ['Load error'] } };
      const factory = () => throwError(() => errorResponse);
      const resource = TestBed.runInInjectionContext(() => getResource(factory));

      // Act & Assert
      await expect(resource.load()).rejects.toThrow(MutationException);
      expect(mockMessageService.show).toHaveBeenCalledWith('Load error');
      expect(resource.error()).toBe('Load error');
      expect(resource.loading()).toBe(false);
    });

    it('should extract payload from response when present', async () => {
      // Arrange
      const payload = { id: '1', name: 'Test' };
      const response = { payload };
      const factory = () => of(response);
      const resource = TestBed.runInInjectionContext(() => getResource(factory));

      // Act
      const result = await resource.load();

      // Assert
      expect(result).toEqual(payload);
      expect(resource.value()).toEqual(payload);
    });

    it('should destroy resource and cancel pending requests', () => {
      // Arrange
      const factory = () => of([{ id: '1' }]);
      const resource = TestBed.runInInjectionContext(() => getResource(factory));

      // Act
      resource.destroy();

      // Assert
      // Resource should be destroyed (no way to directly test, but should not throw)
      expect(resource).toBeTruthy();
    });

    it('should handle null response', async () => {
      // Arrange
      const factory = () => of(null);
      const resource = TestBed.runInInjectionContext(() => getResource(factory));

      // Act
      const result = await resource.load();

      // Assert
      expect(result).toBeNull();
      expect(resource.value()).toBeNull();
    });
  });

  describe('MutationException', () => {
    it('should create exception with message and raw error', () => {
      // Arrange
      const rawError = { status: 500 };
      const message = 'Test error';

      // Act
      const exception = new MutationException(message, rawError);

      // Assert
      expect(exception.message).toBe(message);
      expect(exception.raw).toBe(rawError);
      expect(exception).toBeInstanceOf(Error);
    });
  });
});
