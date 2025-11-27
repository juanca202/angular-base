import { TestBed } from '@angular/core/testing';

import { AilErrorHandler } from './ail-error-handler';

describe('AilErrorHandler', () => {
  let service: AilErrorHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AilErrorHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
