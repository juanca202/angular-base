import { Language } from './language';

/**
 * Environment variables model
 */
export interface Environment {
  appId: string;
  appName: string;
  defaultLocale: string;
  languages: Language[];
  sessionPrefix: string;
  filesPath: string;
  appPath: string;
  // Authentication
  auth: {
    signupUrl: string;
    signinUrl: string;
    refreshTokenUrl: string;
    forgotPasswordUrl: string;
    resetPasswordUrl: string;
    settingsUrl: string;
    allowRefreshToken: boolean;
    allowSignup: boolean;
    allowAuthFederation: boolean;
    tokenType: string;
    clients: {
      google: string;
    };
  };
  // Federated Credential Management
  fedcm?: Record<
    string,
    {
      tokenUrl: string;
      configURL: string;
      clientId: string;
    }
  >;
  graphqlEndpoint?: string;
  restEndpoint: string;
  // Google TagManager
  googleTagManager?: {
    trackingCode: string;
  };
  // Sentry
  sentry?: {
    dsn: string;
    tracingOrigins: string[];
    tracesSampleRate: number;
  };
  // Firebase
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  // Microsoft Application Insights
  appInsights?: {
    instrumentationKey: string;
  };
  vapidKey?: string;
  iconSettings?: {
    path: string;
    collection: string;
  };
}
