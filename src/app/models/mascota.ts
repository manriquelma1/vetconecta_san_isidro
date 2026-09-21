export interface Mascota {
  id: string;
  nombre: string;
  /** Ruta al SVG de `public/fotos`. Las mascotas creadas por el usuario no tienen foto. */
  foto: string | null;
  /** Datos clinicos. Opcionales: las mascotas creadas desde Agendar solo tienen nombre. */
  especie?: string;
  raza?: string;
  edad?: string;
  sexo?: string;
  propietario?: string;
}
