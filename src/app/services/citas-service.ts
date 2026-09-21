import { Injectable, computed, inject, signal } from '@angular/core';
import { Cita, EstadoCita, ESTADOS_CITA } from '../models/cita';
import { Mascota } from '../models/mascota';
import { crearId, guardar, leer } from '../utils/almacenamiento';
import { claveHoy } from '../utils/fecha';
import { AuthService } from './auth-service';

const CLAVE_MASCOTAS = 'vetconecta.mascotas';
const CLAVE_CITAS = 'vetconecta.citas';

const MASCOTAS_INICIALES: Mascota[] = [
  {
    id: 'colita',
    nombre: 'Colita',
    especie: 'Perro',
    raza: 'Mestizo',
    edad: 4,
    peso: 12.5,
    alergias: 'Ninguna',
    foto: 'fotos/colita.svg'
  },
  {
    id: 'luna',
    nombre: 'Luna',
    especie: 'Perro',
    raza: 'Labrador',
    edad: 3,
    peso: 24,
    alergias: 'Ninguna',
    foto: 'fotos/luna.svg'
  },
  {
    id: 'simba',
    nombre: 'Simba',
    especie: 'Gato',
    raza: 'Mestizo',
    edad: 2,
    peso: 5.2,
    alergias: 'Ninguna',
    foto: 'fotos/simba.svg'
  }
];

@Injectable({ providedIn: 'root' })
export class CitasService {
  private readonly auth = inject(AuthService);

  private readonly _mascotas = signal<Mascota[]>(
    leer<Mascota[]>(CLAVE_MASCOTAS, MASCOTAS_INICIALES).map((mascota) => ({
      ...mascota,
      especie: mascota.especie ?? '',
      raza: mascota.raza ?? '',
      edad: mascota.edad ?? 0,
      peso: mascota.peso ?? 0,
      alergias: mascota.alergias ?? ''
    }))
  );

  private readonly _citas = signal<Cita[]>(
    leer<Cita[]>(CLAVE_CITAS, []).map((cita) => ({
      ...cita,
      motivoConsulta: cita.motivoConsulta ?? '',
      estado: cita.estado ?? 'Pendiente',
      propietarioCorreo: cita.propietarioCorreo?.trim().toLowerCase()
    }))
  );

  readonly mascotas = this._mascotas.asReadonly();
  readonly citas = computed(() => {
    const usuario = this.auth.usuario();
    if (!usuario) return [];
    return usuario.rol === 'personal'
      ? this._citas()
      : this._citas().filter((cita) => cita.propietarioCorreo === usuario.correo);
  });

  readonly citasOrdenadas = computed(() =>
    [...this.citas()].sort((a, b) =>
      `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)
    )
  );

  readonly citasProximas = computed(() => {
    const hoy = claveHoy();

    return this.citasOrdenadas().filter(
      (cita) => cita.fecha >= hoy && cita.estado === 'Pendiente'
    );
  });

  readonly citasDeHoy = computed(() => {
    const hoy = claveHoy();

    return this.citasOrdenadas().filter(
      (cita) => cita.fecha === hoy && cita.estado !== 'Cancelada'
    );
  });

  agregarMascota(
    nombre: string,
    especie = '',
    raza = '',
    edad = 0,
    peso = 0,
    alergias = ''
  ): Mascota {
    const mascota: Mascota = {
      id: crearId(),
      nombre: nombre.trim(),
      especie: especie.trim(),
      raza: raza.trim(),
      edad,
      peso,
      alergias: alergias.trim(),
      foto: null
    };

    this._mascotas.update((lista) => [...lista, mascota]);
    guardar(CLAVE_MASCOTAS, this._mascotas());

    return mascota;
  }

  actualizarMascota(id: string, datos: Partial<Mascota>): void {
    this._mascotas.update((lista) =>
      lista.map((mascota) =>
        mascota.id === id
          ? { ...mascota, ...datos, id: mascota.id }
          : mascota
      )
    );

    guardar(CLAVE_MASCOTAS, this._mascotas());
  }

  eliminarMascota(id: string): void {
    this._mascotas.update((lista) =>
      lista.filter((mascota) => mascota.id !== id)
    );

    guardar(CLAVE_MASCOTAS, this._mascotas());
  }

  obtenerMascota(id: string): Mascota | undefined {
    return this._mascotas().find(
      (mascota) => mascota.id === id
    );
  }

  agregarCita(datos: Omit<Cita, 'id' | 'creadaEn' | 'propietarioNombre' | 'propietarioCorreo'>): Cita | null {
    const usuario = this.auth.usuario();
    if (!usuario || usuario.rol !== 'propietario' || this.horasOcupadas(datos.fecha).includes(datos.hora)) {
      return null;
    }

    const cita: Cita = {
      ...datos,
      estado: 'Pendiente',
      propietarioNombre: usuario.nombre,
      propietarioCorreo: usuario.correo,
      id: crearId(),
      creadaEn: new Date().toISOString()
    };

    this._citas.update((lista) => [...lista, cita]);
    guardar(CLAVE_CITAS, this._citas());

    return cita;
  }

  cambiarEstado(
    id: string,
    estado: EstadoCita
  ): string | null {
    const usuario = this.auth.usuario();
    const cita = this._citas().find((actual) => actual.id === id);
    if (!usuario || !cita) return 'La cita no esta disponible.';
    if (!ESTADOS_CITA.includes(estado)) return 'El estado no es valido.';
    if (usuario.rol !== 'personal' && (
      cita.propietarioCorreo !== usuario.correo ||
      cita.estado !== 'Pendiente' || estado !== 'Cancelada'
    )) {
      return 'No tienes permiso para realizar este cambio.';
    }

    if (cita.estado === 'Cancelada' && estado !== 'Cancelada' &&
        this.horasOcupadas(cita.fecha).includes(cita.hora)) {
      return 'El horario ya esta ocupado por otra cita. No se puede reactivar.';
    }

    this._citas.update((lista) =>
      lista.map((cita) =>
        cita.id === id
          ? { ...cita, estado }
          : cita
      )
    );

    guardar(CLAVE_CITAS, this._citas());
    return null;
  }

  horasOcupadas(fecha: string): string[] {
    return this._citas()
      .filter(
        (cita) =>
          cita.fecha === fecha &&
          cita.estado !== 'Cancelada'
      )
      .map((cita) => cita.hora);
  }
}
