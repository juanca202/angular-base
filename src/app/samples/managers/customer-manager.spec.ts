import { TestBed } from '@angular/core/testing';

import { CustomerManager } from './customer-manager';

describe('CustomerManager', () => {
  let service: CustomerManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
