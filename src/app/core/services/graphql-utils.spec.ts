import { TestBed } from '@angular/core/testing';

import { GraphqlUtils } from './graphql-utils';

describe('GraphqlUtils', () => {
  let service: GraphqlUtils;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphqlUtils);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
