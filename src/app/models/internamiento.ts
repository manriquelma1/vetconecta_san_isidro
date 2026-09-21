export interface Tratamiento {
  id: string;
  nombre: string;
  horario: string;
  detalle: string;
  realizado: boolean;
}

export interface EvolucionInternamiento {
  id: string;
  fecha: string;
  hora: string;
  nota: string;
  veterinario: string;
}

export interface InternamientoMascota {
  id: string;
  mascotaId: string;
  jaula: string;
  motivoIngreso: string;
  fechaIngreso: string;
  horaIngreso: string;
  estado: 'Internado' | 'Alta';
  fechaAlta: string | null;
  temperatura: number;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
  tratamientos: Tratamiento[];
  evoluciones: EvolucionInternamiento[];
}