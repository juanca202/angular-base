import { TestBed } from '@angular/core/testing';

import { EntityManager } from './entity-manager';

describe('EntityManager', () => {
  let service: EntityManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntityManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
