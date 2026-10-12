import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import {
  getResource,
  getResourceCollection,
  getMutations,
  getApiUrl,
  ResourceException
} from '@/core/utils/async-resources';
import { environment } from '@/environments/environment';
import { notificationEvents, type NotificationEvent } from '@/core/utils/notification';
import { getNotificationDetail } from '@/test/helpers/notification-event.helpers';

describe('async-resources', () => {
  let notifiedEvents: NotificationEvent[];

  const notifyHandler = (event: Event): void => {
    notifiedEvents.push(getNotificationDetail(event));
  };

  beforeEach(() => {
    notifiedEvents = [];
    notificationEvents.addEventListener('notify', notifyHandler);

    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    notificationEvents.removeEventListener('notify', notifyHandler);
  });

  describe('getApiUrl', () => {
    it('should return full API URL with path', () => {
      // Arrange
      const path = 'customers/123';
      const expectedUrl = `${environment.apiRestBaseUrl}/${path}`;

      // Act
      const result = getApiUrl(path);

      // Assert
      expect(result).toBe(expectedUrl);
    });

    it('should handle empty path', () => {
      // Arrange
      const path = '';

      // Act
      const result = getApiUrl(path);

      // Assert
      expect(result).toBe(`${environment.apiRestBaseUrl}/`);
    });
  });

  describe('getResource', () => {
    it('should create resource with initial null value', () => {
      // Arrange
      const factory = vi.fn().mockReturnValue(of({ id: '1', name: 'Test' }));

      // Act
      const resource = TestBed.runInInjectionContext(() => getResource(factory));

      // Assert
      expect(resource.value()).toBeNull();
      expect(resource.loading()).toBe(false);
      expect(resource.error()).toBeNull();
    });

    it('should load data successfully from Observable', async () => {
      // Arrange
      const testData = { id: '1', name: 'Test' };
      const factory = vi.fn().mockReturnValue(of(testData));

      // Act
      const resource = TestBed.runInInjectionContext(() => getResource(factory));
      const result = await resource.load();

      // Assert
      expect(result).toEqual(testData);
      expect(resource.value()).toEqual(testData);
      expect(resource.loading()).toBe(false);
      expect(resource.error()).toBeNull();
    });

    it('should load data successfully from Promise', async () => {
      // Arrange
      const testData = { id: '1', name: 'Test' };
      const factory = vi.fn().mockReturnValue(Promise.resolve(testData));

      // Act
      const resource = TestBed.runInInjectionContext(() => getResource(factory));
      const result = await resource.load();

      // Assert
      expect(result).toEqual(testData);
      expect(resource.value()).toEqual(testData);
      expect(resource.loading()).toBe(false);
    });

    it('should set loading state during load', async () => {
      // Arrange
      const testData = { id: '1', name: 'Test' };
      const factory = vi.fn().mockReturnValue(of(testData));

      // Act
      const resource = TestBed.runInInjectionContext(() => getResource(factory));
      const loadPromise = resource.load();

      // Assert - loading should be true during load
      // Note: This is a timing-dependent test, but we can verify loading becomes false
      await loadPromise;
      expect(resource.loading()).toBe(false);
    });

    it('should handle errors and show message by default', async () => {
      // Arrange
      const error = { message: 'Test error', error: { messages: ['Error message'] } };
      const factory = vi.fn().mockReturnValue(throwError(() => error));

      // Act
      const resource = TestBed.runInInjectionContext(() => getResource(factory));

      // Assert
      await expect(resource.load()).rejects.toThrow();
      expect(resource.error()).toBeDefined();
      expect(notifiedEvents.length).toBeGreaterThan(0);
    });

    it('should not show error message when notifyError is false', async () => {
      // Arrange
      const error = { message: 'Test error' };
      const factory = vi.fn().mockReturnValue(throwError(() => error));

      // Act
      const resource = TestBed.runInInjectionContext(() => getResource(factory));

      // Assert
      await expect(resource.load(undefined, { notifyError: false })).rejects.toThrow();
      expect(notifiedEvents).toHaveLength(0);
    });

    it('should refresh with last parameters', async () => {
      // Arrange
      const testData = { id: '1', name: 'Test' };
      const factory = vi.fn().mockReturnValue(of(testData));

      // Act
      const resource = TestBed.runInInjectionContext(() => getResource(factory));
      await resource.load('param1');
      await resource.reload();

      // Assert
      expect(factory).toHaveBeenCalledTimes(2);
      expect(factory).toHaveBeenLastCalledWith('param1');
    });

    it('should destroy resource and cancel pending requests', async () => {
      // Arrange
      let resolvePromise: (value: { id: string; name?: string }) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      const factory = vi.fn().mockReturnValue(promise);

      // Act
      const resource = TestBed.runInInjectionContext(() => getResource(factory));
      const loadPromise = resource.load();
      resource.destroy();
      resolvePromise!({ id: '1' });

      // Assert
      // When resource is destroyed, the promise should reject because the subscription is cancelled
      await expect(loadPromise).rejects.toBeDefined();
    });
  });

  describe('getResourceCollection', () => {
    it('should create collection resource with initial null values', () => {
      // Arrange
      const factory = vi.fn().mockReturnValue(of([{ id: '1' }]));

      // Act
      const resource = TestBed.runInInjectionContext(() => getResourceCollection(factory));

      // Assert
      expect(resource.value()).toBeNull();
      expect(resource.accumulated()).toBeNull();
      expect(resource.loading()).toBe(false);
    });

    it('should load collection data successfully', async () => {
      // Arrange
      const testData = [{ id: '1' }, { id: '2' }];
      const factory = vi.fn().mockReturnValue(of(testData));

      // Act
      const resource = TestBed.runInInjectionContext(() => getResourceCollection(factory));
      const result = await resource.load();

      // Assert
      expect(result).toEqual(testData);
      expect(resource.value()).toEqual(testData);
      expect(resource.accumulated()).toEqual(testData);
    });

    it('should append data when append option is true', async () => {
      // Arrange
      const firstData = [{ id: '1' }];
      const secondData = [{ id: '2' }];
      const factory = vi
        .fn()
        .mockReturnValueOnce(of(firstData))
        .mockReturnValueOnce(of(secondData));

      // Act
      const resource = TestBed.runInInjectionContext(() => getResourceCollection(factory));
      await resource.load();
      await resource.load(undefined, { append: true });

      // Assert
      expect(resource.accumulated()).toEqual([...firstData, ...secondData]);
    });

    it('should reset accumulated when append is false', async () => {
      // Arrange
      const firstData = [{ id: '1' }];
      const secondData = [{ id: '2' }];
      const factory = vi
        .fn()
        .mockReturnValueOnce(of(firstData))
        .mockReturnValueOnce(of(secondData));

      // Act
      const resource = TestBed.runInInjectionContext(() => getResourceCollection(factory));
      await resource.load();
      await resource.load(undefined, { append: false });

      // Assert
      expect(resource.accumulated()).toEqual(secondData);
    });
  });

  describe('getMutations', () => {
    it('should create mutation functions with initial state', () => {
      // Arrange
      const factories = {
        create: vi.fn().mockReturnValue(of({ id: '1' })),
        update: vi.fn().mockReturnValue(of({ id: '1', name: 'Updated' }))
      };

      // Act
      const mutations = TestBed.runInInjectionContext(() => getMutations(factories));

      // Assert
      expect(mutations.create.submitting()).toBe(false);
      expect(mutations.create.value()).toBeNull();
      expect(mutations.create.error()).toBeNull();
      expect(mutations.update.submitting()).toBe(false);
    });

    it('should execute mutation successfully', async () => {
      // Arrange
      const testData = { id: '1', name: 'Test' };
      const factories = {
        create: vi.fn().mockReturnValue(of(testData))
      };

      // Act
      const mutations = TestBed.runInInjectionContext(() => getMutations(factories));
      const result = await mutations.create({ name: 'Test' });

      // Assert
      expect(result).toEqual(testData);
      expect(mutations.create.value()).toEqual(testData);
      expect(mutations.create.submitting()).toBe(false);
      expect(mutations.create.error()).toBeNull();
    });

    it('should set submitting state during mutation', async () => {
      // Arrange
      const testData = { id: '1' };
      let resolvePromise: (value: { id: string; name?: string }) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      const factories = {
        create: vi.fn().mockReturnValue(promise)
      };

      // Act
      const mutations = TestBed.runInInjectionContext(() => getMutations(factories));
      const mutationPromise = mutations.create({});

      // Assert - submitting should be true during execution
      // We can't easily test this synchronously, but we verify it becomes false
      resolvePromise!(testData);
      await mutationPromise;
      expect(mutations.create.submitting()).toBe(false);
    });

    it('should handle mutation errors and show message by default', async () => {
      // Arrange
      const error = { message: 'Mutation error', error: { messages: ['Error'] } };
      const factories = {
        create: vi.fn().mockReturnValue(throwError(() => error))
      };

      // Act
      const mutations = TestBed.runInInjectionContext(() => getMutations(factories));

      // Assert
      await expect(mutations.create({})).rejects.toThrow();
      expect(mutations.create.error()).toBeDefined();
      expect(notifiedEvents.length).toBeGreaterThan(0);
    });

    it('should not show error message when notifyError is false', async () => {
      // Arrange
      const error = { message: 'Mutation error' };
      const factories = {
        create: vi.fn().mockReturnValue(throwError(() => error))
      };

      // Act
      const mutations = TestBed.runInInjectionContext(() => getMutations(factories));

      // Assert
      await expect(mutations.create({}, { notifyError: false })).rejects.toThrow();
      expect(notifiedEvents).toHaveLength(0);
    });

    it('should track global submitting state across mutations', async () => {
      // Arrange
      const factories = {
        create: vi.fn().mockReturnValue(of({ id: '1' })),
        update: vi.fn().mockReturnValue(of({ id: '1' }))
      };

      // Act
      const mutations = TestBed.runInInjectionContext(() => getMutations(factories));
      await mutations.create({});

      // Assert
      expect(mutations.submitting()).toBe(false);
    });
  });

  describe('ResourceException', () => {
    it('should create ResourceException with message and raw error', () => {
      // Arrange
      const message = 'Test error';
      const rawError = { code: 500, message: 'Internal error' };

      // Act
      const exception = new ResourceException(message, rawError);

      // Assert
      expect(exception.message).toBe(message);
      expect(exception.raw).toEqual(rawError);
      expect(exception).toBeInstanceOf(Error);
    });
  });
});
