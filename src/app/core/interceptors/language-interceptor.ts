import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AppManager } from '@/core/services/app-manager';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const appManager = inject(AppManager);
  const langReq = req.clone({
    setHeaders: {
      'Accept-Language': appManager.getLocale()
    }
  });
  return next(langReq);
};
