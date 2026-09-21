export interface Usuario {
  nombre: string;
  correo: string;
  /** Como inicio sesion: con formulario o con el boton de Google. */
  proveedor: 'correo' | 'google';
}
