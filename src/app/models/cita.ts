export interface Cita {
  id: string;
  mascotaId: string;
  mascotaNombre: string;
  servicio: string;
  /** Formato YYYY-MM-DD */
  fecha: string;
  /** Formato HH:mm */
  hora: string;
  /** Fecha ISO en la que se registro la cita */
  creadaEn: string;
  /** Solo en visitas pasadas registradas desde Historial. */
  veterinario?: string;
  notas?: string;
}
