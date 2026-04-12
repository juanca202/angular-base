import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MockHttpClient } from './mock-http-client';
import { environment } from '@/environments/environment';

describe('MockHttpClient', () => {
  let service: MockHttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockHttpClient]
    });
    service = TestBed.inject(MockHttpClient);
  });

  describe('loadCollection', () => {
    it('should load collection data', async () => {
      // Arrange
      const data = [{ id: '1', name: 'Test' }];

      // Act
      service.loadCollection('test', data);

      // Assert
      // Verificamos que se puede obtener la colección después
      const result = await firstValueFrom(service.get(`${environment.apiRestBaseUrl}/test`));
      expect(result).toEqual(data);
    });

    it('should create independent copies of data', async () => {
      // Arrange
      const originalData = [{ id: '1', name: 'Original' }];
      service.loadCollection('test', originalData);

      // Act
      const result: any = await firstValueFrom(service.get(`${environment.apiRestBaseUrl}/test`));
      result[0].name = 'Modified';

      // Assert - El original no debe cambiar
      const original: any = await firstValueFrom(service.get(`${environment.apiRestBaseUrl}/test`));
      expect(original[0].name).toBe('Original');
    });
  });

  describe('get', () => {
    beforeEach(() => {
      service.loadCollection('items', [
        { id: '1', name: 'Item 1', category: 'A' },
        { id: '2', name: 'Item 2', category: 'B' },
        { id: '3', name: 'Item 3', category: 'A' }
      ]);
    });

    it('should return all items when no ID is provided', async () => {
      // Act
      const result: any = await firstValueFrom(service.get(`${environment.apiRestBaseUrl}/items`));

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });

    it('should return single item when ID is provided', async () => {
      // Act
      const result: any = await firstValueFrom(
        service.get(`${environment.apiRestBaseUrl}/items/1`)
      );

      // Assert
      expect(result).toEqual({ id: '1', name: 'Item 1', category: 'A' });
    });

    it('should return error when collection does not exist', async () => {
      // Act & Assert
      await expect(
        firstValueFrom(service.get(`${environment.apiRestBaseUrl}/nonexistent`))
      ).rejects.toThrow("Collection 'nonexistent' not loaded");
    });

    it('should filter data by query parameters', async () => {
      // Arrange
      const params = new HttpParams().set('category', 'A');

      // Act
      const result: any = await firstValueFrom(
        service.get(`${environment.apiRestBaseUrl}/items`, { params })
      );

      // Assert
      expect(result.length).toBe(2);
      expect(result.every((item: any) => item.category === 'A')).toBe(true);
    });

    it('should apply pagination with page and pageSize', async () => {
      // Arrange
      const params = new HttpParams().set('page', '1').set('pageSize', '2');

      // Act
      const result: any = await firstValueFrom(
        service.get(`${environment.apiRestBaseUrl}/items`, { params })
      );

      // Assert
      expect(result.length).toBe(2);
    });
  });

  describe('post', () => {
    beforeEach(() => {
      service.loadCollection('items', [{ id: '1', name: 'Item 1' }]);
    });

    it('should create new item with generated ID', async () => {
      // Arrange
      const newItem = { name: 'New Item' };

      // Act
      const result: any = await firstValueFrom(
        service.post(`${environment.apiRestBaseUrl}/items`, newItem)
      );

      // Assert
      expect(result.id).toBeDefined();
      expect(result.name).toBe('New Item');
      expect(typeof result.id).toBe('string');
    });

    it('should add item to collection', async () => {
      // Arrange
      const newItem = { name: 'New Item' };

      // Act
      await firstValueFrom(service.post(`${environment.apiRestBaseUrl}/items`, newItem));
      const allItems: any = await firstValueFrom(
        service.get(`${environment.apiRestBaseUrl}/items`)
      );

      // Assert
      expect(allItems.length).toBe(2);
      expect(allItems[0].name).toBe('New Item'); // Se agrega al inicio
    });

    it('should create collection if it does not exist', async () => {
      // Arrange
      const newItem = { name: 'New Item' };

      // Act
      const result: any = await firstValueFrom(
        service.post(`${environment.apiRestBaseUrl}/newcollection`, newItem)
      );

      // Assert
      expect(result.id).toBeDefined();
      expect(result.name).toBe('New Item');
    });
  });

  describe('put', () => {
    beforeEach(() => {
      service.loadCollection('items', [{ id: '1', name: 'Item 1', value: 10 }]);
    });

    it('should update existing item', async () => {
      // Arrange
      const updatedData = { name: 'Updated Item', value: 20 };

      // Act
      const result: any = await firstValueFrom(
        service.put(`${environment.apiRestBaseUrl}/items/1`, updatedData)
      );

      // Assert
      expect(result.name).toBe('Updated Item');
      expect(result.value).toBe(20);
      expect(result.id).toBe('1');
    });

    it('should return error when ID is missing', async () => {
      // Act & Assert
      await expect(
        firstValueFrom(service.put(`${environment.apiRestBaseUrl}/items`, { name: 'Test' }))
      ).rejects.toThrow('Missing id for PUT');
    });

    it('should return error when item not found', async () => {
      // Act & Assert
      await expect(
        firstValueFrom(service.put(`${environment.apiRestBaseUrl}/items/999`, { name: 'Test' }))
      ).rejects.toThrow('Item not found');
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      service.loadCollection('items', [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' }
      ]);
    });

    it('should delete item by ID', async () => {
      // Act
      await firstValueFrom(service.delete(`${environment.apiRestBaseUrl}/items/1`));
      const result: any = await firstValueFrom(service.get(`${environment.apiRestBaseUrl}/items`));

      // Assert
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('2');
    });

    it('should return error when ID is missing', async () => {
      // Act & Assert
      await expect(
        firstValueFrom(service.delete(`${environment.apiRestBaseUrl}/items`))
      ).rejects.toThrow('Missing id for DELETE');
    });
  });
});
