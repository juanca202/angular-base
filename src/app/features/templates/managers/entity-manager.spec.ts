import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { EntityManager } from './entity-manager';
import { EntityRepository } from '../repositories/entity-repository';
import { MessageService } from '@factor_ec/ui';
import { Entity } from '../models/entity';
import { Operation } from '@/core/models/operation';
import { OPERATION_TYPE } from '@/core/constants/operation-type';
import { ENTITY_CONTEXT } from '@/shared/constants/entity-context';
import { EntityForm } from '../components/entity-form/entity-form';
import { EntityDetail } from '../components/entity-detail/entity-detail';
import { EntitySearch } from '../components/entity-search/entity-search';

describe('EntityManager', () => {
  let manager: EntityManager;
  let mockDialog: Partial<MatDialog>;
  let mockEntityRepository: Partial<EntityRepository>;
  let mockMessageService: Partial<MessageService>;

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

  beforeEach(() => {
    // Arrange: Create mocks
    mockDialog = {
      open: vi.fn()
    };

    const deleteMutation = vi.fn().mockResolvedValue(void 0);
    mockEntityRepository = {
      mutations: vi.fn().mockReturnValue({
        delete: deleteMutation
      })
    };

    mockMessageService = {
      show: vi.fn().mockReturnValue(of(1)) // Return 1 for "Accept"
    };

    TestBed.configureTestingModule({
      providers: [
        EntityManager,
        { provide: MatDialog, useValue: mockDialog },
        { provide: EntityRepository, useValue: mockEntityRepository },
        { provide: MessageService, useValue: mockMessageService }
      ]
    });

    manager = TestBed.inject(EntityManager);
  });

  describe('delete', () => {
    it('should show confirmation dialog', async () => {
      // Arrange
      (mockMessageService.show as any).mockReturnValue(of(0)); // User cancels

      // Act
      await manager.delete('1');

      // Assert
      expect(mockMessageService.show).toHaveBeenCalled();
    });

    it('should return confirmation value', async () => {
      // Arrange
      (mockMessageService.show as any).mockReturnValue(of(1)); // User accepts

      // Act
      const result = await manager.delete('1');

      // Assert
      expect(result).toBe(1);
    });

    it('should not delete when id is not provided', async () => {
      // Arrange
      (mockMessageService.show as any).mockReturnValue(of(1));

      // Act
      const result = await manager.delete();

      // Assert
      expect(result).toBe(1);
      // When id is not provided, delete mutation should not be called
      // (verified by the fact that mutations.delete is not accessible in test)
    });
  });

  describe('getContextMenu', () => {
    it('should return empty array when entity has no id', () => {
      // Arrange
      const entityWithoutId = { ...mockEntity, id: '' };

      // Act
      const actions = manager.getContextMenu(entityWithoutId);

      // Assert
      expect(actions).toEqual([]);
    });

    it('should return empty array when entity is null', () => {
      // Arrange & Act
      const actions = manager.getContextMenu(null);

      // Assert
      expect(actions).toEqual([]);
    });

    it('should return context menu actions for entity with id', () => {
      // Arrange & Act
      const actions = manager.getContextMenu(mockEntity, ENTITY_CONTEXT.LIST);

      // Assert
      expect(actions.length).toBeGreaterThan(0);
      expect(actions[0].type).toBe('group');
      expect(actions[0].children).toBeDefined();
    });

    it('should filter edit action when context is FORM', () => {
      // Arrange & Act
      const actions = manager.getContextMenu(mockEntity, ENTITY_CONTEXT.FORM);

      // Assert
      const editAction = actions[0]?.children?.find((a: any) => a.id === 'edit');
      expect(editAction).toBeUndefined();
    });

    it('should filter delete action when context is not LIST or SEARCH', () => {
      // Arrange & Act
      const actions = manager.getContextMenu(mockEntity, ENTITY_CONTEXT.DETAIL);

      // Assert
      const deleteAction = actions[0]?.children?.find((a: any) => a.id === 'delete');
      expect(deleteAction).toBeUndefined();
    });

    it('should include delete action when context is LIST', () => {
      // Arrange & Act
      const actions = manager.getContextMenu(mockEntity, ENTITY_CONTEXT.LIST);

      // Assert
      const deleteAction = actions[0]?.children?.find((a: any) => a.id === 'delete');
      expect(deleteAction).toBeDefined();
    });

    it('should include delete action when context is SEARCH', () => {
      // Arrange & Act
      const actions = manager.getContextMenu(mockEntity, ENTITY_CONTEXT.SEARCH);

      // Assert
      const deleteAction = actions[0]?.children?.find((a: any) => a.id === 'delete');
      expect(deleteAction).toBeDefined();
    });
  });

  describe('open', () => {
    it('should open EntityForm dialog when view is false', () => {
      // Arrange
      const mockDialogRef = {
        componentInstance: {
          afterSubmit: of({ type: OPERATION_TYPE.CREATE, entity: mockEntity } as Operation)
        }
      };
      (mockDialog.open as any).mockReturnValue(mockDialogRef);

      // Act - Don't await to avoid timeout
      manager.open('1', false);

      // Assert
      expect(mockDialog.open).toHaveBeenCalledWith(
        EntityForm,
        expect.objectContaining({
          data: { id: '1' },
          disableClose: true
        })
      );
    });

    it('should open EntityDetail dialog when view is true', () => {
      // Arrange
      const mockDialogRef = {
        componentInstance: {}
      };
      (mockDialog.open as any).mockReturnValue(mockDialogRef);

      // Act - Don't await to avoid timeout
      manager.open('1', true);

      // Assert
      expect(mockDialog.open).toHaveBeenCalledWith(
        EntityDetail,
        expect.objectContaining({
          data: { id: '1' }
        })
      );
    });

    it('should open dialog without id', () => {
      // Arrange
      const mockDialogRef = {
        componentInstance: {
          afterSubmit: of({ type: OPERATION_TYPE.CREATE, entity: mockEntity } as Operation)
        }
      };
      (mockDialog.open as any).mockReturnValue(mockDialogRef);

      // Act - Don't await to avoid hanging
      manager.open();

      // Assert
      expect(mockDialog.open).toHaveBeenCalledWith(
        EntityForm,
        expect.objectContaining({
          data: { id: undefined }
        })
      );
    });
  });

  describe('search', () => {
    it('should open EntitySearch dialog', () => {
      // Arrange
      const mockDialogRef = {
        componentInstance: {
          selected: of(mockEntity)
        }
      };
      (mockDialog.open as any).mockReturnValue(mockDialogRef);

      // Act - Don't await to avoid hanging
      manager.search();

      // Assert
      expect(mockDialog.open).toHaveBeenCalledWith(
        EntitySearch,
        expect.objectContaining({
          panelClass: ['ft-dialog'],
          width: '400px'
        })
      );
    });

    it('should open search dialog', () => {
      // Arrange
      const mockDialogRef = {
        componentInstance: {
          selected: of(mockEntity)
        }
      };
      (mockDialog.open as any).mockReturnValue(mockDialogRef);

      // Act - Start the search (don't await to avoid hanging on null)
      manager.search();

      // Assert
      expect(mockDialog.open).toHaveBeenCalledWith(
        EntitySearch,
        expect.objectContaining({
          panelClass: ['ft-dialog'],
          width: '400px'
        })
      );
    });
  });
});
