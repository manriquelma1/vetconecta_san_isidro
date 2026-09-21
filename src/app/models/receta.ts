export interface Receta {
  id: string;
  mascotaId: string;
  veterinario: string;
  fechaEmision: string;
  fechaFin: string;
  medicamentos: MedicamentoReceta[];
}

export interface MedicamentoReceta {
  id: string;
  nombre: string;
  dosis: string;
  duracion: string;
}