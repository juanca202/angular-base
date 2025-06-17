import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppService } from './app.service';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const appService = inject(AppService);
  const langReq = req.clone({
    setHeaders: {
      'Accept-Language': appService.getLocale()
    }
  });
  return next(langReq);
};
