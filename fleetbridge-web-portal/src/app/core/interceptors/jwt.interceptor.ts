import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const oauthStorage = inject(OAuthStorage);
  const router = inject(Router);
  
  const token = oauthStorage.getItem('access_token');

  // Only attach token to requests going to our API Gateway
  if (token && req.url.startsWith(environment.apiBaseUrl)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        oauthStorage.removeItem('access_token');
        oauthStorage.removeItem('refresh_token');
        oauthStorage.removeItem('id_token');
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
