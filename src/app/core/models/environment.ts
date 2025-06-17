interface FedCMProvider {
  tokenUrl: string;
  configURL: string;
  clientId: string;
}

/**
 * Modelo de variables de ambiente
 */
export interface Environment {
  auth: {
    signupUrl: string;
    tokenUrl: string;
    refreshTokenUrl: string;
    forgotPasswordUrl: string;
    resetPasswordUrl: string;
    settingsUrl: string;
    allowRefreshToken: boolean;
    clients: {
      google: string;
    };
  };
  fedcm: Record<string, FedCMProvider>;
  sessionPrefix: string;
  iconSettings: {
    path: string;
    collection: string;
  };
  filesPath: string;
  appPath: string;
  graphqlEndpoint: string;
  restEndpoint: string;
  serverEndpoint: string;
  apiIdPrefix: string;
  supportEmail: string;
  googleApi: {
    clientId: string;
  };
  googleTagManager: {
    trackingCode: string;
  };
  sentry: {
    dsn: string;
    tracingOrigins: string[];
    tracesSampleRate: number;
  };
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  vapidKey: string;
}
