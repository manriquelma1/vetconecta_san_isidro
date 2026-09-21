export const ESTADOS_CITA = ['Pendiente', 'Atendida', 'Cancelada'] as const;
export type EstadoCita = typeof ESTADOS_CITA[number];

export interface Cita {
  id: string;
  mascotaId: string;
  mascotaNombre: string;
  servicio: string;
  motivoConsulta: string;
  fecha: string;
  hora: string;
  estado: EstadoCita;
  /** Opcionales para conservar las citas antiguas sin atribuirles un propietario. */
  propietarioNombre?: string;
  propietarioCorreo?: string;
  creadaEn: string;
  /** Solo en visitas pasadas registradas desde Historial. */
  veterinario?: string;
  notas?: string;
}
