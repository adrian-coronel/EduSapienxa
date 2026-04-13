import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 400) {
        toast.error('Datos inválidos. Verifica la información ingresada.');
      } else if (err.status === 403) {
        toast.error('No tienes permisos para realizar esta acción.');
      } else if (err.status === 500) {
        toast.error('Error del servidor. Intenta nuevamente más tarde.');
      }
      return throwError(() => err);
    })
  );
};
