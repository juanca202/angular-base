import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { GraphqlService } from './graphql.service';
import { StringService } from '@factor_ec/utils';

describe('GraphqlService', () => {
  let service: GraphqlService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GraphqlService,
        {
          provide: Apollo,
          useValue: {
            mutate: jest.fn(),
            query: jest.fn(),
            watchQuery: jest.fn(),
          },
        },
        { provide: StringService, useValue: { slugify: jest.fn() } },
      ],
    });
    service = TestBed.inject(GraphqlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
