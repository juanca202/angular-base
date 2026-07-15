import { Environment } from '../app/core/models/environment';

export const environment: Environment = {
  appId: 'abp',
  appName: 'ABP',
  sessionPrefix: '',
  apiRestBaseUrl: '',
  i18n: {
    enabled: false,
    defaultLocale: 'en',
    languages: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' }
    ]
  },
  iconSettings: {
    path: 'images',
    collection: 'factoricons-regular'
  }
};
