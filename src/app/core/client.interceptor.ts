import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AppService } from 'app/core/app.service';

export const clientInterceptor: HttpInterceptorFn = (req, next) => {
  const appService = inject(AppService);
  const clientReq = req.clone({
    setHeaders: {
      'Client-Id': appService.getClientId(),
      'App-Id': appService.id,
      'App-Version': appService.version
    }
  });
  return next(clientReq);
};
