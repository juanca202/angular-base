import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AppManager } from 'app/core/app-manager';

export const clientInterceptor: HttpInterceptorFn = (req, next) => {
  const appManager = inject(AppManager);
  const clientReq = req.clone({
    setHeaders: {
      'Client-Id': appManager.getClientId(),
      'App-Id': appManager.id,
      'App-Version': appManager.version,
    },
  });
  return next(clientReq);
};
