import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';

import { ContactList } from './contact-list';
import { ContactsRepository } from '../../repositories/contacts-repository';
import { ContactManager } from '../../managers/contact-manager';
import { LayoutManager } from '@/core/services/layout-manager';
import type { SignalGet } from '@/core/utils/async-repository';
import type { Contact } from '../../models/contact';

type TestSignalGet = SignalGet<void, Contact[]> & {
  __setValue: (data: Contact[]) => void;
};

describe('ContactList', () => {
  let component: ContactList;
  let fixture: ComponentFixture<ContactList>;
  let contactsResource: TestSignalGet;

  const createSignalGet = (): TestSignalGet => {
    const valueSignal = signal<Contact[] | null>([]);
    const loadingSignal = signal(false);
    const errorSignal = signal<any | null>(null);

    return {
      value: valueSignal.asReadonly(),
      loading: loadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      load: vi.fn().mockResolvedValue([]),
      refresh: vi.fn().mockResolvedValue([]),
      destroy: vi.fn(),
      __setValue: (data: Contact[]) => valueSignal.set(data)
    };
  };

  beforeEach(async () => {
    contactsResource = createSignalGet();

    await TestBed.configureTestingModule({
      imports: [ContactList],
      providers: [
        {
          provide: ContactsRepository,
          useValue: {
            findBy: vi.fn(() => contactsResource)
          }
        },
        {
          provide: ContactManager,
          useValue: { openContact: vi.fn(), getContextMenu: vi.fn(() => []) }
        },
        { provide: LayoutManager, useValue: { setOverlapped: vi.fn(), getRandomNumber: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactList);
    component = fixture.componentInstance;
  });

  it('loads contacts during initialization', () => {
    component.ngOnInit();
    expect(contactsResource.load).toHaveBeenCalledTimes(1);
  });
});
