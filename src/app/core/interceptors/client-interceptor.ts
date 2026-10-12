import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AppManager } from '@/core/services/app-manager';
import { environment } from '@/environments/environment';
import { versionInfo } from '@/version-info';

export const clientInterceptor: HttpInterceptorFn = (req, next) => {
  const appManager = inject(AppManager);
  const clientReq = req.clone({
    headers: req.headers
      .set('Client-Id', appManager.getClientId())
      .set('App-Id', environment.appId)
      .set('App-Version', versionInfo.git.raw)
  });
  return next(clientReq);
};
