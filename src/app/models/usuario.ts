export type RolUsuario = 'propietario' | 'personal';

export interface Usuario {
  nombre: string;
  correo: string;
  rol: RolUsuario;
  proveedor: 'correo' | 'google';
}

export interface UsuarioRegistrado extends Usuario {
  clave: string;
}