import { Injectable, computed, signal } from '@angular/core';
import { Cita } from '../models/cita';
import { Mascota } from '../models/mascota';
import { crearId, guardar, leer } from '../utils/almacenamiento';
import { claveHoy } from '../utils/fecha';

const CLAVE_MASCOTAS = 'vetconecta.mascotas';
const CLAVE_CITAS = 'vetconecta.citas';

const MASCOTAS_INICIALES: Mascota[] = [
  {
    id: 'colita', nombre: 'Colita', foto: 'fotos/colita.svg',
    especie: 'Canino', raza: 'Mestiza', edad: '3 años', sexo: 'Hembra',
    propietario: 'Carlos Mendoza',
  },
  {
    id: 'luna', nombre: 'Luna', foto: 'fotos/luna.svg',
    especie: 'Felino', raza: 'Criollo', edad: '2 años', sexo: 'Hembra',
    propietario: 'Carlos Mendoza',
  },
  {
    id: 'simba', nombre: 'Simba', foto: 'fotos/simba.svg',
    especie: 'Canino', raza: 'Labrador', edad: '5 años', sexo: 'Macho',
    propietario: 'Carlos Mendoza',
  },
];

@Injectable({ providedIn: 'root' })
export class CitasService {
  private readonly _mascotas = signal<Mascota[]>(leer(CLAVE_MASCOTAS, MASCOTAS_INICIALES));
  private readonly _citas = signal<Cita[]>(leer<Cita[]>(CLAVE_CITAS, []));

  readonly mascotas = this._mascotas.asReadonly();
  readonly citas = this._citas.asReadonly();

  /** Citas ordenadas de la mas proxima a la mas lejana. */
  readonly citasOrdenadas = computed(() =>
    [...this._citas()].sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)),
  );

  /** Citas de hoy en adelante, de la mas proxima a la mas lejana. */
  readonly citasProximas = computed(() => {
    const hoy = claveHoy();
    return this.citasOrdenadas().filter((cita) => cita.fecha >= hoy);
  });

  /** Citas agendadas para el dia de hoy. */
  readonly citasDeHoy = computed(() => {
    const hoy = claveHoy();
    return this.citasOrdenadas().filter((cita) => cita.fecha === hoy);
  });

  /** Citas ya pasadas, de la mas reciente a la mas antigua. */
  readonly citasPasadas = computed(() => {
    const hoy = claveHoy();
    return this.citasOrdenadas()
      .filter((cita) => cita.fecha < hoy)
      .reverse();
  });

  agregarMascota(datos: Omit<Mascota, 'id' | 'foto'>): Mascota {
    const mascota: Mascota = { ...datos, nombre: datos.nombre.trim(), id: crearId(), foto: null };
    this._mascotas.update((lista) => [...lista, mascota]);
    guardar(CLAVE_MASCOTAS, this._mascotas());
    return mascota;
  }

  agregarCita(datos: Omit<Cita, 'id' | 'creadaEn'>): Cita {
    const cita: Cita = { ...datos, id: crearId(), creadaEn: new Date().toISOString() };
    this._citas.update((lista) => [...lista, cita]);
    guardar(CLAVE_CITAS, this._citas());
    return cita;
  }

  eliminarCita(id: string): void {
    this._citas.update((lista) => lista.filter((cita) => cita.id !== id));
    guardar(CLAVE_CITAS, this._citas());
  }

  /** Horas ya reservadas en una fecha (YYYY-MM-DD). */
  horasOcupadas(fecha: string): string[] {
    return this._citas().filter((cita) => cita.fecha === fecha).map((cita) => cita.hora);
  }
}
