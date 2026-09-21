import { Injectable, signal } from '@angular/core';
import { Receta } from '../models/receta';
import { leer } from '../utils/almacenamiento';

const CLAVE_RECETAS = 'vetconecta.recetas';

const RECETAS_INICIALES: Receta[] = [
  {
    id: 'receta-1',
    mascotaId: 'luna',
    veterinario: 'Dr. Carlos Mendoza',
    fechaEmision: '2026-09-18',
    fechaFin: '2026-09-25',
    medicamentos: [
      {
        id: 'med-1',
        nombre: 'Amoxicilina 250mg',
        dosis: '1 tableta cada 12 horas',
        duracion: '7 días'
      },
      {
        id: 'med-2',
        nombre: 'Meloxicam suspensión',
        dosis: '0.5 ml cada 24 horas',
        duracion: '3 días'
      }
    ]
  },
  {
    id: 'receta-2',
    mascotaId: 'colita',
    veterinario: 'Dra. Andrea Ruiz',
    fechaEmision: '2026-09-10',
    fechaFin: '2026-09-13',
    medicamentos: [
      {
        id: 'med-3',
        nombre: 'Meloxicam 2mg',
        dosis: '0.5 ml cada 24 horas',
        duracion: '3 días'
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class RecetasService {
  private readonly _recetas = signal<Receta[]>(
    leer<Receta[]>(CLAVE_RECETAS, RECETAS_INICIALES)
  );

  readonly recetas = this._recetas.asReadonly();
}