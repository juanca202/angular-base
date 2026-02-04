import { Environment } from '../app/core/models/environment';

export const environment: Environment = {
  appId: 'abp',
  appName: 'ABP',
  auth: {
    signupUrl: 'http://localhost:8000/authentication_signup',
    signinUrl: 'http://localhost:8000/authentication_token',
    refreshTokenUrl: 'http://localhost:8000/authentication_refresh_token',
    forgotPasswordUrl: 'http://localhost:8000/authentication_forgot-password',
    resetPasswordUrl: 'http://localhost:8000/authentication_reset-password',
    settingsUrl: 'http://localhost:8000/api/settings',
    allowRefreshToken: true,
    allowSignup: true,
    allowAuthFederation: false,
    clients: {
      google: 'http://localhost:8000/connect/google'
    }
  },
  sessionPrefix: 'abp',
  iconSettings: {
    path: '/images',
    collection: 'factoricons-regular'
  },
  filesPath: 'http://localhost:8000/files',
  appPath: 'http://localhost:4200',
  restEndpoint: 'http://localhost:8000/api',
  appInsights: {
    instrumentationKey: 'f65d5284-fcfd-4a62-b1f3-278edf12aa8d'
  }
  /*
  apiIdPrefix: '/api/',
  graphqlEndpoint: 'http://localhost:8000/api/graphql',
  fedcm: {
    google: {
      signinUrl: 'http://localhost:8000/auth/fedcm/google',
      configURL: 'https://accounts.google.com/o/fedcm/config.json',
      clientId: ''
    }
  },
  googleApi: {
    clientId: ''
  },
  googleTagManager: {
    trackingCode: ''
  },
  sentry: {
    dsn: '',
    tracingOrigins: ['localhost'],
    tracesSampleRate: 1.0
  },
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  },
  vapidKey: ''
  */
};
