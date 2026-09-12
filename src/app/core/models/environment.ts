import { Language } from '@/core/models/language';

/**
 * Environment variables model
 */
export interface Environment {
  appId: string;
  appName: string;
  sessionPrefix: string;
  apiRestBaseUrl: string;
  i18n: {
    enabled: boolean;
    defaultLocale: string;
    languages: Language[];
  };
  iconSettings?: {
    path: string;
    collection: string;
  };
  googleTagManager?: {
    trackingCode: string;
  };
}
