import { Environment } from '../app/core/models/environment';

export const environment: Environment = {
  appId: 'abp',
  appName: 'ABP',
  defaultLocale: 'en',
  languages: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' }
  ],
  auth: {
    signupUrl: '',
    signinUrl: '',
    refreshTokenUrl: '',
    forgotPasswordUrl: '',
    resetPasswordUrl: '',
    settingsUrl: '',
    allowRefreshToken: true,
    allowSignup: true,
    allowAuthFederation: false,
    tokenType: '',
    clients: {
      google: ''
    }
  },
  sessionPrefix: '',
  iconSettings: {
    path: '/images',
    collection: 'factoricons-regular'
  },
  filesPath: '',
  appPath: '',
  restEndpoint: ''
  /*
  apiIdPrefix: '',
  graphqlEndpoint: '',
  fedcm: {
    google: {
      tokenUrl: '',
      configURL: '',
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
