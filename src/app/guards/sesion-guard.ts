import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

/** Protege las paginas internas: sin sesion manda al login. */
export const sesionGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.autenticado() ? true : router.createUrlTree(['/login']);
};

/** El rol tambien se comprueba cuando se escribe la URL directamente. */
export const personalGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.autenticado()) return router.createUrlTree(['/login']);
  return auth.esPersonal() ? true : router.createUrlTree([auth.inicio()]);
};

export const propietarioGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.autenticado()) return router.createUrlTree(['/login']);
  return !auth.esPersonal() ? true : router.createUrlTree([auth.inicio()]);
};

/** Evita que alguien ya autenticado vuelva a ver el login. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.autenticado() ? router.createUrlTree([auth.inicio()]) : true;
};
