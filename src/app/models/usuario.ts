export type RolUsuario = 'propietario' | 'personal';

export interface Usuario {
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

/** Lo que devuelve POST /api/auth/login y /api/auth/registro. */
export interface RespuestaAuth extends Usuario {
  token: string;
}
