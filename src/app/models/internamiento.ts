export interface Tratamiento {
  id: string;
  nombre: string;
  horario: string;
  detalle: string;
  realizado: boolean;
}

export interface InternamientoMascota {
  id: string;
  mascotaId: string;
  jaula: string;
  fechaIngreso: string;
  horaIngreso: string;
  temperatura: number;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
  tratamientos: Tratamiento[];
}