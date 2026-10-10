import { HttpErrorResponse } from '@angular/common/http';

/**
 * El backend devuelve dos formas de error distintas segun donde falle:
 * - Nuestro ExceptionHandlingMiddleware: { mensaje, errores: [{ campo, error }] | null }
 * - El binding automatico de ASP.NET antes de llegar al handler: { title, errors: { campo: string[] } }
 * Esta funcion extrae el mensaje mas especifico que encuentre en cualquiera de las dos formas.
 */
export function extraerMensajeError(error: unknown, porDefecto = 'Ocurrió un error. Intenta de nuevo.'): string {
  if (!(error instanceof HttpErrorResponse)) {
    return porDefecto;
  }

  const cuerpo = error.error;

  if (cuerpo && typeof cuerpo === 'object') {
    if (Array.isArray(cuerpo.errores) && cuerpo.errores.length > 0 && cuerpo.errores[0]?.error) {
      return String(cuerpo.errores[0].error);
    }

    if (typeof cuerpo.mensaje === 'string' && cuerpo.mensaje) {
      return cuerpo.mensaje;
    }

    if (cuerpo.errors && typeof cuerpo.errors === 'object') {
      const primerCampo = Object.values(cuerpo.errors)[0];
      if (Array.isArray(primerCampo) && primerCampo.length > 0) {
        return String(primerCampo[0]);
      }
    }

    if (typeof cuerpo.title === 'string' && cuerpo.title) {
      return cuerpo.title;
    }
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor.';
  }

  return porDefecto;
}
