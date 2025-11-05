import { TestBed } from '@angular/core/testing';
import { GraphqlUtils } from './graphql-utils';
import { StringService } from '@factor_ec/utils';
import { Apollo } from 'apollo-angular';

describe('GraphqlUtils', () => {
  let service: GraphqlUtils;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: StringService,
          useValue: { normalizeName: (s: string) => s[0].toUpperCase() + s.slice(1) },
        },
        { provide: Apollo, useValue: new Apollo() },
      ],
    });
    service = TestBed.inject(GraphqlUtils);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
