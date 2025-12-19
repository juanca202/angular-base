import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AilErrorHandler } from './ail-error-handler';

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
