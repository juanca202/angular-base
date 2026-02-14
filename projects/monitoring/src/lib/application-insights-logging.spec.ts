import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ApplicationInsightsLogging } from './application-insights-logging';
import {
  mockTrackPageView,
  mockTrackEvent,
  mockTrackMetric,
  mockTrackException,
  mockTrackTrace,
  setupApplicationInsightsMock,
  clearApplicationInsightsMocks
} from '@/test/mocks/application-insights';
import { setupEnvironmentMock } from '@/test/mocks/environment';

// Setup mocks
setupApplicationInsightsMock();
setupEnvironmentMock({
  appInsights: {
    instrumentationKey: 'test-key'
  }
});

describe('ApplicationInsightsLogging', () => {
  let service: ApplicationInsightsLogging;

  beforeEach(() => {
    // Limpiar mocks antes de cada test
    clearApplicationInsightsMocks();

    TestBed.configureTestingModule({
      providers: [ApplicationInsightsLogging]
    });

    service = TestBed.inject(ApplicationInsightsLogging);
  });

  describe('logPageView', () => {
    it('should call trackPageView with name and url', () => {
      // Arrange
      const name = 'Test Page';
      const url = '/test-page';

      // Act
      service.logPageView(name, url);

      // Assert
      expect(mockTrackPageView).toHaveBeenCalledWith({
        name: name,
        uri: url
      });
    });

    it('should call trackPageView with undefined when no parameters', () => {
      // Act
      service.logPageView();

      // Assert
      expect(mockTrackPageView).toHaveBeenCalledWith({
        name: undefined,
        uri: undefined
      });
    });
  });

  describe('logEvent', () => {
    it('should call trackEvent with name and properties', () => {
      // Arrange
      const name = 'Test Event';
      const properties = { key: 'value' };

      // Act
      service.logEvent(name, properties);

      // Assert
      expect(mockTrackEvent).toHaveBeenCalledWith({ name: name }, properties);
    });

    it('should call trackEvent without properties when not provided', () => {
      // Arrange
      const name = 'Test Event';

      // Act
      service.logEvent(name);

      // Assert
      expect(mockTrackEvent).toHaveBeenCalledWith({ name: name }, undefined);
    });
  });

  describe('logMetric', () => {
    it('should call trackMetric with name, average and properties', () => {
      // Arrange
      const name = 'Test Metric';
      const average = 42.5;
      const properties = { unit: 'ms' };

      // Act
      service.logMetric(name, average, properties);

      // Assert
      expect(mockTrackMetric).toHaveBeenCalledWith({ name: name, average: average }, properties);
    });

    it('should call trackMetric without properties when not provided', () => {
      // Arrange
      const name = 'Test Metric';
      const average = 42.5;

      // Act
      service.logMetric(name, average);

      // Assert
      expect(mockTrackMetric).toHaveBeenCalledWith({ name: name, average: average }, undefined);
    });
  });

  describe('logException', () => {
    it('should call trackException with exception and severity level', () => {
      // Arrange
      const error = new Error('Test error');
      const severityLevel = 4;

      // Act
      service.logException(error, severityLevel);

      // Assert
      expect(mockTrackException).toHaveBeenCalledWith({
        exception: error,
        severityLevel: severityLevel
      });
    });

    it('should call trackException without severity level when not provided', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      service.logException(error);

      // Assert
      expect(mockTrackException).toHaveBeenCalledWith({
        exception: error,
        severityLevel: undefined
      });
    });
  });

  describe('logTrace', () => {
    it('should call trackTrace with message and properties', () => {
      // Arrange
      const message = 'Test trace message';
      const properties = { source: 'test' };

      // Act
      service.logTrace(message, properties);

      // Assert
      expect(mockTrackTrace).toHaveBeenCalledWith({ message: message }, properties);
    });

    it('should call trackTrace without properties when not provided', () => {
      // Arrange
      const message = 'Test trace message';

      // Act
      service.logTrace(message);

      // Assert
      expect(mockTrackTrace).toHaveBeenCalledWith({ message: message }, undefined);
    });
  });
});
