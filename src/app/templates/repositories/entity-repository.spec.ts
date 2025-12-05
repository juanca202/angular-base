import { TestBed } from '@angular/core/testing';

import { EntityRepository } from './entity-repository';

describe('EntityRepository', () => {
  let service: EntityRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntityRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
