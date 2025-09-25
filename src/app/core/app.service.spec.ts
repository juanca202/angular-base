import { TestBed } from '@angular/core/testing';
import { AppService } from 'app/core/app.service';
jest.mock('version-info', () => ({ versionInfo: { version: 'test', hash: 'abc' } }));

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
