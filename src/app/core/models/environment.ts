import { Language } from './language';

/**
 * Environment variables model
 */
export interface Environment {
  appId: string;
  appName: string;
  defaultLocale: string;
  languages: Language[];
  sessionPrefix: string;
  apiRestBaseUrl: string;
  i18n?: boolean;
  iconSettings?: {
    path: string;
    collection: string;
  };
  googleTagManager?: {
    trackingCode: string;
  };
}
