import { Environment } from '../app/core/models/environment';

export const environment: Environment = {
  auth: {
    signupUrl: '',
    tokenUrl: '',
    refreshTokenUrl: '',
    forgotPasswordUrl: '',
    resetPasswordUrl: '',
    settingsUrl: '',
    allowRefreshToken: true,
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
