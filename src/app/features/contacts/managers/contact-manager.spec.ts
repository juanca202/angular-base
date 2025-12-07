import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { ContactManager } from './contact-manager';
import { ContactDetail } from '@/features/contacts/components/contact-detail/contact-detail';
import { ContactSearch } from '@/features/contacts/components/contact-search/contact-search';

describe('ContactManager', () => {
  let service: ContactManager;
  let mockDialog: jest.Mocked<MatDialog>;

  beforeEach(() => {
    mockDialog = {
      open: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: mockDialog }]
    });
    service = TestBed.inject(ContactManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open contact detail dialog with id when id is provided', () => {
    // Arrange
    const contactId = 'contact-123';

    // Act
    service.open(contactId);

    // Assert
    expect(mockDialog.open).toHaveBeenCalledWith(ContactDetail, {
      data: {
        id: contactId
      },
      panelClass: ['ft-dialog', 'ft-dialog--stacked'],
      height: '100vh',
      width: '600px',
      position: {
        left: 'auto',
        right: '0'
      }
    });
  });

  it('should open contact detail dialog without id when creating new contact', () => {
    // Arrange & Act
    service.open();

    // Assert
    expect(mockDialog.open).toHaveBeenCalledWith(ContactDetail, {
      data: {
        id: undefined
      },
      panelClass: ['ft-dialog', 'ft-dialog--stacked'],
      height: '100vh',
      width: '600px',
      position: {
        left: 'auto',
        right: '0'
      }
    });
  });

  it('should open contact search dialog', () => {
    // Arrange & Act
    service.search();

    // Assert
    expect(mockDialog.open).toHaveBeenCalledWith(ContactSearch, {
      panelClass: ['ft-dialog'],
      width: '400px'
    });
  });
});
