import { Injectable, signal } from '@angular/core';
import { InternamientoMascota } from '../models/internamiento';
import { guardar, leer } from '../utils/almacenamiento';

const CLAVE_INTERNAMIENTOS = 'vetconecta.internamientos';

const INTERNAMIENTOS_INICIALES: InternamientoMascota[] = [
  {
    id: 'internamiento-colita',
    mascotaId: 'colita',
    jaula: 'Jaula 04',
    fechaIngreso: '2026-09-20',
    horaIngreso: '08:30',
    temperatura: 38.5,
    frecuenciaCardiaca: 80,
    frecuenciaRespiratoria: 20,
    tratamientos: [
      {
        id: 'tratamiento-1',
        nombre: 'Cefalexina 500mg (IV)',
        horario: '08:00',
        detalle: 'Dr. Ruiz',
        realizado: true
      },
      {
        id: 'tratamiento-2',
        nombre: 'Meloxicam 2mg (SC)',
        horario: '12:00',
        detalle: 'Pendiente',
        realizado: false
      },
      {
        id: 'tratamiento-3',
        nombre: 'Fluidoterapia (RL)',
        horario: 'Continua',
        detalle: '50ml/h',
        realizado: false
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class InternamientoService {
  private readonly _internamientos = signal<InternamientoMascota[]>(
    leer<InternamientoMascota[]>(
      CLAVE_INTERNAMIENTOS,
      INTERNAMIENTOS_INICIALES
    )
  );

  readonly internamientos = this._internamientos.asReadonly();

  obtener(id: string): InternamientoMascota | undefined {
    return this._internamientos().find(
      (internamiento) => internamiento.id === id
    );
  }

  actualizarSignos(
    id: string,
    temperatura: number,
    frecuenciaCardiaca: number,
    frecuenciaRespiratoria: number
  ): void {
    this._internamientos.update((lista) =>
      lista.map((internamiento) =>
        internamiento.id === id
          ? {
              ...internamiento,
              temperatura,
              frecuenciaCardiaca,
              frecuenciaRespiratoria
            }
          : internamiento
      )
    );

    guardar(CLAVE_INTERNAMIENTOS, this._internamientos());
  }

  cambiarEstadoTratamiento(
    internamientoId: string,
    tratamientoId: string,
    realizado: boolean
  ): void {
    this._internamientos.update((lista) =>
      lista.map((internamiento) =>
        internamiento.id === internamientoId
          ? {
              ...internamiento,
              tratamientos: internamiento.tratamientos.map((tratamiento) =>
                tratamiento.id === tratamientoId
                  ? {
                      ...tratamiento,
                      realizado
                    }
                  : tratamiento
              )
            }
          : internamiento
      )
    );

    guardar(CLAVE_INTERNAMIENTOS, this._internamientos());
  }
}