import { HttpInterceptorFn } from '@angular/common/http';

import { apiBaseUrl } from '../config/api';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.url.startsWith('http://') || request.url.startsWith('https://')) {
    return next(request);
  }

  return next(
    request.clone({
      url: `${apiBaseUrl}${request.url.startsWith('/') ? request.url : `/${request.url}`}`,
    }),
  );
};
