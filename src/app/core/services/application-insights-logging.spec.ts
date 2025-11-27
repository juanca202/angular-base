import { TestBed } from '@angular/core/testing';

import { ApplicationInsightsLogging } from './application-insights-logging';

describe('ApplicationInsightsLogging', () => {
  let service: ApplicationInsightsLogging;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationInsightsLogging);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
