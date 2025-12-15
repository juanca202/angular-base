import { TestBed } from '@angular/core/testing';

import { MockHttpClient } from './mock-http-client';

describe('MockHttpClient', () => {
  let service: MockHttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockHttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
