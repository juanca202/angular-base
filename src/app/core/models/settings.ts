export interface Subscription {
  code: string;
  name: string;
  plan: {
    code: string;
    name: string;
  };
}
export interface Settings {
  user: {
    username: string;
    email: string;
    roles: string[];
    firstName: string;
    lastName: string;
    picture: string;
    featureFlags: string[];
  };
  preferences: {
    language: string;
  };
  subscription: Subscription;
  featureFlags?: string[];
  permissions?: string[];
  environment: string;
  onboarding: boolean;
  country: string;
}
