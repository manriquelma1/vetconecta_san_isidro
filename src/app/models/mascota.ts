export interface Mascota {
  id: string;
  nombre: string;
  /** Ruta al SVG de `public/fotos`. Las mascotas creadas por el usuario no tienen foto. */
  foto: string | null;
}
