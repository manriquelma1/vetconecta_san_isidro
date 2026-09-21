export interface Vacuna {
  id: string;
  mascotaId: string;
  nombre: string;
  fechaAplicacion: string;
  proximaDosis: string;
  estado: 'Al día' | 'Vencida';
}

export interface VisitaMedica {
  id: string;
  mascotaId: string;
  fecha: string;
  hora: string;
  motivo: string;
  descripcion: string;
  diagnostico: string;
  tratamiento: string;
  veterinario: string;
}
