import { Environment } from '../app/core/models/environment';

export const environment: Environment = {
  appId: 'abp',
  appName: 'ABP',
  defaultLocale: 'en',
  languages: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' }
  ],
  sessionPrefix: '',
  apiRestBaseUrl: '',
  i18n: false,
  iconSettings: {
    path: 'images',
    collection: 'factoricons-regular'
  }
};
