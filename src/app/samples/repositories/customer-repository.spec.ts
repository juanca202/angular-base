import { TestBed } from '@angular/core/testing';

import { CustomerRepository } from './customer-repository';

describe('CustomerRepository', () => {
  let service: CustomerRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
