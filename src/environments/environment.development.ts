import { Environment } from '../app/core/models/environment';

export const environment: Environment = {
  auth: {
    signupUrl: 'http://localhost:8000/authentication_signup',
    tokenUrl: 'http://localhost:8000/authentication_token',
    refreshTokenUrl: 'http://localhost:8000/authentication_refresh_token',
    forgotPasswordUrl: 'http://localhost:8000/authentication_forgot-password',
    resetPasswordUrl: 'http://localhost:8000/authentication_reset-password',
    settingsUrl: 'http://localhost:8000/api/settings',
    allowRefreshToken: true,
    clients: {
      google: 'http://localhost:8000/connect/google',
    },
  },
  fedcm: {
    google: {
      tokenUrl: 'http://localhost:8000/auth/fedcm/google',
      configURL: 'https://accounts.google.com/o/fedcm/config.json',
      clientId:
        '224754736281-tgu6t0kuf3mgjb621lus8gh54sj607lb.apps.googleusercontent.com',
    },
  },
  sessionPrefix: 'tp',
  iconSettings: {
    path: '/images',
    collection: 'factoricons-regular',
  },
  filesPath: 'http://localhost:8000/files',
  appPath: 'http://localhost:4200',
  graphqlEndpoint: 'http://localhost:8000/api/graphql',
  restEndpoint: 'http://localhost:8000/api',
  serverEndpoint: 'http://localhost:8000',
  apiIdPrefix: '/api/',
  supportEmail: 'support@email.com',
  googleApi: {
    clientId:
      '224754736281-tgu6t0kuf3mgjb621lus8gh54sj607lb.apps.googleusercontent.com',
  },
  googleTagManager: {
    trackingCode: '',
  },
  sentry: {
    dsn: 'https://011a881484abbbc6dd4f1157a93959e1@o498284.ingest.us.sentry.io/4507207222755328',
    tracingOrigins: ['localhost', 'https://factor.ec'],
    tracesSampleRate: 1.0,
  },
  firebaseConfig: {
    apiKey: 'AIzaSyD5xyqCqcUXAA4yo8OcR6_tCgxz4RVu7AU',
    authDomain: 'tripot-5d5c6.firebaseapp.com',
    databaseURL: 'https://tripot-5d5c6-default-rtdb.firebaseio.com',
    projectId: 'tripot-5d5c6',
    storageBucket: 'tripot-5d5c6.appspot.com',
    messagingSenderId: '621788368517',
    appId: '1:621788368517:web:75d886e9d60d68e63a23ec',
    measurementId: 'G-4Z1QWPCW6B',
  },
  vapidKey:
    'BPhVK_ylSTCSpDkQd5p1vmI2ImGe_P5-KcWgPzxV-VrGitzNx7yXjFcTJOg2Bdb55hE54Pbs4sGaZDOi_BBxSQo',
};
