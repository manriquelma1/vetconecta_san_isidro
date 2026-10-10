import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Cita, EstadoCita } from '../models/cita';
import { Mascota } from '../models/mascota';
import { claveHoy } from '../utils/fecha';
import { extraerMensajeError } from '../utils/http-error';
import { environment } from '../../environments/environment';
import { AuthService } from './auth-service';

interface NuevaMascota {
  nombre: string;
  especie?: string;
  raza?: string;
  edad?: number;
  peso?: number;
  alergias?: string;
}

@Injectable({ providedIn: 'root' })
export class CitasService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  private readonly _mascotas = signal<Mascota[]>([]);
  private readonly _citas = signal<Cita[]>([]);

  readonly mascotas = this._mascotas.asReadonly();

  /** Ya viene ordenada y filtrada por rol desde el backend (GET /api/citas). */
  readonly citasOrdenadas = this._citas.asReadonly();

  readonly citasProximas = computed(() => {
    const hoy = claveHoy();
    return this.citasOrdenadas().filter((cita) => cita.fecha >= hoy && cita.estado === 'Pendiente');
  });

  readonly citasDeHoy = computed(() => {
    const hoy = claveHoy();
    return this.citasOrdenadas().filter((cita) => cita.fecha === hoy && cita.estado !== 'Cancelada');
  });

  constructor() {
    // Carga mascotas y citas apenas hay sesion (al iniciar sesion o al restaurarla desde localStorage).
    effect(() => {
      if (this.auth.autenticado()) {
        this.cargarMascotas();
        this.cargarCitas();
      } else {
        this._mascotas.set([]);
        this._citas.set([]);
      }
    });
  }

  async cargarMascotas(): Promise<void> {
    try {
      const mascotas = await firstValueFrom(this.http.get<Mascota[]>(`${this.apiUrl}/mascotas`));
      this._mascotas.set(mascotas);
    } catch {
      // Si falla, las mascotas quedan como estaban; los componentes muestran su propio error si lo necesitan.
    }
  }

  async cargarCitas(): Promise<void> {
    try {
      const citas = await firstValueFrom(this.http.get<Cita[]>(`${this.apiUrl}/citas`));
      this._citas.set(citas);
    } catch {
      // Igual que cargarMascotas: no hay donde mostrar el error en este punto.
    }
  }

  obtenerMascota(id: string): Mascota | undefined {
    return this._mascotas().find((mascota) => mascota.id === id);
  }

  async agregarMascota(
    nombre: string,
    especie = '',
    raza = '',
    edad = 0,
    peso = 0,
    alergias = ''
  ): Promise<Mascota> {
    const datos: NuevaMascota = { nombre, especie, raza, edad, peso, alergias };

    try {
      const mascota = await firstValueFrom(this.http.post<Mascota>(`${this.apiUrl}/mascotas`, datos));
      this._mascotas.update((lista) => [...lista, mascota].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      return mascota;
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }

  async actualizarMascota(id: string, datos: Partial<Mascota>): Promise<void> {
    const mascota = this.obtenerMascota(id);

    try {
      await firstValueFrom(
        this.http.put(`${this.apiUrl}/mascotas/${id}`, {
          id,
          nombre: datos.nombre ?? mascota?.nombre ?? '',
          especie: datos.especie ?? mascota?.especie ?? '',
          raza: datos.raza ?? mascota?.raza ?? '',
          edad: datos.edad ?? mascota?.edad ?? 0,
          peso: datos.peso ?? mascota?.peso ?? 0,
          alergias: datos.alergias ?? mascota?.alergias ?? '',
        })
      );

      this._mascotas.update((lista) =>
        lista.map((m) => (m.id === id ? { ...m, ...datos, id: m.id } : m))
      );
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }

  async eliminarMascota(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/mascotas/${id}`));
      this._mascotas.update((lista) => lista.filter((mascota) => mascota.id !== id));
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }

  /**
   * Horarios ocupados en una fecha, compartidos por toda la clinica (no por dueño).
   * No puede calcularse localmente: un propietario solo tiene en cache SUS citas,
   * no las de los demas, asi que esto siempre pregunta al backend.
   */
  async horasOcupadas(fecha: string): Promise<string[]> {
    try {
      return await firstValueFrom(
        this.http.get<string[]>(`${this.apiUrl}/citas/horas-ocupadas`, { params: { fecha } })
      );
    } catch {
      return [];
    }
  }

  async agregarCita(datos: {
    mascotaId: string;
    mascotaNombre: string;
    servicio: string;
    motivoConsulta: string;
    fecha: string;
    hora: string;
  }): Promise<Cita> {
    try {
      const cita = await firstValueFrom(this.http.post<Cita>(`${this.apiUrl}/citas`, datos));
      this._citas.update((lista) => [...lista, cita]);
      return cita;
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }

  /** Devuelve un mensaje de error, o null si el cambio se aplico bien (misma firma que antes). */
  async cambiarEstado(id: string, estado: EstadoCita): Promise<string | null> {
    try {
      await firstValueFrom(this.http.patch(`${this.apiUrl}/citas/${id}/estado`, { id, estado }));
      this._citas.update((lista) => lista.map((cita) => (cita.id === id ? { ...cita, estado } : cita)));
      return null;
    } catch (error) {
      return extraerMensajeError(error);
    }
  }
}
