import { HttpInterceptorFn } from '@angular/common/http';
import { leer } from '../utils/almacenamiento';

const CLAVE_TOKEN = 'vetconecta.token';

/** Adjunta el JWT guardado a cada peticion hacia nuestra propia API. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = leer<string | null>(CLAVE_TOKEN, null);

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};
