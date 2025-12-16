import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ApplicationInsightsLogging } from './application-insights-logging';

// Mock ApplicationInsights
vi.mock('@microsoft/applicationinsights-web', () => {
  class MockApplicationInsights {
    loadAppInsights = vi.fn();
    trackPageView = vi.fn();
    trackEvent = vi.fn();
    trackMetric = vi.fn();
    trackException = vi.fn();
    trackTrace = vi.fn();
  }
  return {
    ApplicationInsights: MockApplicationInsights
  };
});

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
