import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Vacuna, VisitaMedica } from '../models/historial-medico';
import { extraerMensajeError } from '../utils/http-error';
import { environment } from '../../environments/environment';

interface HistorialMascota {
  vacunas: Vacuna[];
  visitas: VisitaMedica[];
}

type DatosNuevaVisita = Omit<VisitaMedica, 'id'>;

/**
 * A diferencia de CitasService/RecetasService, aqui no hay una carga inicial
 * de "todo": el backend expone el historial de UNA mascota a la vez
 * (GET /api/historial/mascota/:id), igual que vacunasDeMascota()/visitasDeMascota()
 * operaban sobre una mascota en la version con localStorage.
 */
@Injectable({ providedIn: 'root' })
export class HistorialService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly _vacunas = signal<Vacuna[]>([]);
  private readonly _visitas = signal<VisitaMedica[]>([]);
  private mascotaCargada = '';

  readonly vacunas = this._vacunas.asReadonly();
  readonly visitas = this._visitas.asReadonly();

  async cargarHistorial(mascotaId: string): Promise<void> {
    if (!mascotaId || this.mascotaCargada === mascotaId) {
      return;
    }

    try {
      const historial = await firstValueFrom(
        this.http.get<HistorialMascota>(`${this.apiUrl}/historial/mascota/${mascotaId}`)
      );

      this._vacunas.set(historial.vacunas);
      this._visitas.set(historial.visitas);
      this.mascotaCargada = mascotaId;
    } catch {
      this._vacunas.set([]);
      this._visitas.set([]);
    }
  }

  /**
   * Vacunas de TODAS las mascotas visibles (no solo la cargada con cargarHistorial).
   * Lo usa el panel de recordatorios para listar refuerzos proximos.
   */
  async cargarTodasLasVacunas(): Promise<Vacuna[]> {
    try {
      return await firstValueFrom(this.http.get<Vacuna[]>(`${this.apiUrl}/historial/vacunas`));
    } catch {
      return [];
    }
  }

  vacunasDeMascota(mascotaId: string): Vacuna[] {
    return this._vacunas().filter((vacuna) => vacuna.mascotaId === mascotaId);
  }

  visitasDeMascota(mascotaId: string): VisitaMedica[] {
    return this._visitas()
      .filter((visita) => visita.mascotaId === mascotaId)
      .sort((a, b) => `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`));
  }

  /** Solo el personal veterinario registra una atencion (HU-08). */
  async agregarVisita(datos: DatosNuevaVisita): Promise<VisitaMedica> {
    try {
      const visita = await firstValueFrom(
        this.http.post<VisitaMedica>(`${this.apiUrl}/historial/visitas`, datos)
      );

      if (this.mascotaCargada === visita.mascotaId) {
        this._visitas.update((lista) => [visita, ...lista]);
      }

      return visita;
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }
}
