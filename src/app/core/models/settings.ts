export interface Subscription {
  code: string;
  name: string;
  plan: {
    code: string;
    name: string;
  };
}
export interface Settings {
  language: string;
  subscription: Subscription;
  featureFlags?: string[];
  environment: string;
  onboarding: boolean;
}
