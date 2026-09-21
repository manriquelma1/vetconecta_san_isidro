export interface Cita {
  id: string;
  mascotaId: string;
  mascotaNombre: string;
  servicio: string;
  motivoConsulta: string;
  fecha: string;
  hora: string;
  estado: 'Pendiente' | 'Atendida' | 'Cancelada';
  creadaEn: string;
  /** Solo en visitas pasadas registradas desde Historial. */
  veterinario?: string;
  notas?: string;
}