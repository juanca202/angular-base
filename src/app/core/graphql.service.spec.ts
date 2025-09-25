import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { GraphqlService } from './graphql.service';

describe('GraphqlService', () => {
  let service: GraphqlService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Apollo,
          useValue: {
            mutate: jest.fn(),
            query: jest.fn(),
            watchQuery: jest.fn(),
          },
        },
      ],
    });
    service = TestBed.inject(GraphqlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
