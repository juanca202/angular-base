import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AppManager } from '@/core/services/app-manager';

export const clientInterceptor: HttpInterceptorFn = (req, next) => {
  const appManager = inject(AppManager);
  const clientReq = req.clone({
    headers: req.headers
      .set('Client-Id', appManager.getClientId())
      .set('App-Id', appManager.id)
      .set('App-Version', appManager.version)
  });
  return next(clientReq);
};
