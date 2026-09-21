export type RolUsuario = 'propietario' | 'personal';

export interface Usuario {
  nombre: string;
  correo: string;
  rol: RolUsuario;
  /** Como inicio sesion: con formulario o con el boton de Google. */
  proveedor: 'correo' | 'google';
}
