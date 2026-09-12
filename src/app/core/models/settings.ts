import { User } from '@/core/models/user';

export interface Subscription {
  code: string;
  name: string;
  plan: {
    code: string;
    name: string;
  };
}
export interface Settings {
  user: User;
  language: string;
  subscription: Subscription;
  featureFlags?: string[];
  environment: string;
  onboarding: boolean;
  country: string;
}
