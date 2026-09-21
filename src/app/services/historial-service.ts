import { Injectable, computed, signal } from '@angular/core';
import { Vacuna, VisitaMedica } from '../models/historial-medico';
import { crearId, guardar, leer } from '../utils/almacenamiento';

const CLAVE_VACUNAS = 'vetconecta.vacunas';
const CLAVE_VISITAS = 'vetconecta.visitas';

const VACUNAS_INICIALES: Vacuna[] = [
  {
    id: 'vacuna-1',
    mascotaId: 'colita',
    nombre: 'Séxtuple canina',
    fechaAplicacion: '2026-03-12',
    proximaDosis: '2027-03-12',
    estado: 'Al día'
  },
  {
    id: 'vacuna-2',
    mascotaId: 'colita',
    nombre: 'Antirrábica',
    fechaAplicacion: '2026-04-05',
    proximaDosis: '2027-04-05',
    estado: 'Al día'
  },
  {
    id: 'vacuna-3',
    mascotaId: 'colita',
    nombre: 'Bordetella',
    fechaAplicacion: '2025-05-10',
    proximaDosis: '2026-05-10',
    estado: 'Vencida'
  }
];

const VISITAS_INICIALES: VisitaMedica[] = [
  {
    id: 'visita-1',
    mascotaId: 'colita',
    fecha: '2026-03-14',
    hora: '10:30',
    motivo: 'Revisión por tos crónica',
    descripcion: 'Paciente presenta tos seca desde hace 3 días. Se realiza evaluación clínica.',
    diagnostico: 'Traqueobronquitis leve',
        tratamiento: 'Broncodilatador y reposo por 5 días',
    veterinario: 'Dr. Alejandro Gómez'
  }
];

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private readonly _vacunas = signal<Vacuna[]>(
    leer<Vacuna[]>(CLAVE_VACUNAS, VACUNAS_INICIALES)
  );

  private readonly _visitas = signal<VisitaMedica[]>(
    leer<VisitaMedica[]>(CLAVE_VISITAS, VISITAS_INICIALES)
  );

  readonly vacunas = this._vacunas.asReadonly();
  readonly visitas = this._visitas.asReadonly();

  vacunasDeMascota(mascotaId: string): Vacuna[] {
    return this._vacunas().filter(
      (vacuna) => vacuna.mascotaId === mascotaId
    );
  }

  visitasDeMascota(mascotaId: string): VisitaMedica[] {
    return this._visitas()
      .filter((visita) => visita.mascotaId === mascotaId)
      .sort((a, b) =>
        `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`)
      );
  }

  agregarVacuna(datos: Omit<Vacuna, 'id'>): Vacuna {
    const vacuna: Vacuna = {
      ...datos,
      id: crearId()
    };

    this._vacunas.update((lista) => [...lista, vacuna]);
    guardar(CLAVE_VACUNAS, this._vacunas());

    return vacuna;
  }

  agregarVisita(datos: Omit<VisitaMedica, 'id'>): VisitaMedica {
    const visita: VisitaMedica = {
      ...datos,
      id: crearId()
    };

    this._visitas.update((lista) => [...lista, visita]);
    guardar(CLAVE_VISITAS, this._visitas());

    return visita;
  }
}