/**
 * Configuration required by auth-core services.
 * Provided via AUTH_CONFIG injection token from app.config.
 */
export interface AuthConfig {
  sessionPrefix: string;
  appPath: string;
  auth: {
    signinUrl: string;
    signupUrl: string;
    refreshTokenUrl: string;
    tokenType: string;
    clients: Record<string, string>;
  };
  fedcm?: Record<
    string,
    {
      tokenUrl: string;
      configURL: string;
      clientId: string;
    }
  >;
}
