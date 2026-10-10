import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { EvolucionInternamiento, InternamientoMascota } from '../models/internamiento';
import { extraerMensajeError } from '../utils/http-error';
import { environment } from '../../environments/environment';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class InternamientoService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  private readonly _internamientos = signal<InternamientoMascota[]>([]);

  readonly internamientos = this._internamientos.asReadonly();

  constructor() {
    effect(() => {
      if (this.auth.autenticado()) {
        this.cargarInternamientos();
      } else {
        this._internamientos.set([]);
      }
    });
  }

  async cargarInternamientos(): Promise<void> {
    try {
      const internamientos = await firstValueFrom(
        this.http.get<InternamientoMascota[]>(`${this.apiUrl}/internamientos`)
      );
      this._internamientos.set(internamientos);
    } catch {
      // Sin donde mostrar el error aqui; el componente muestra su propio estado vacio.
    }
  }

  obtener(id: string): InternamientoMascota | undefined {
    return this._internamientos().find((internamiento) => internamiento.id === id);
  }

  async actualizarSignos(
    id: string,
    temperatura: number,
    frecuenciaCardiaca: number,
    frecuenciaRespiratoria: number
  ): Promise<void> {
    try {
      const actualizado = await firstValueFrom(
        this.http.put<InternamientoMascota>(`${this.apiUrl}/internamientos/${id}/signos`, {
          id,
          temperatura,
          frecuenciaCardiaca,
          frecuenciaRespiratoria,
        })
      );
      this.reemplazar(actualizado);
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }

  async cambiarEstadoTratamiento(
    internamientoId: string,
    tratamientoId: string,
    realizado: boolean
  ): Promise<void> {
    try {
      const actualizado = await firstValueFrom(
        this.http.put<InternamientoMascota>(
          `${this.apiUrl}/internamientos/${internamientoId}/tratamientos/${tratamientoId}`,
          realizado
        )
      );
      this.reemplazar(actualizado);
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }

  async agregarEvolucion(
    internamientoId: string,
    datos: Omit<EvolucionInternamiento, 'id'>
  ): Promise<void> {
    try {
      const actualizado = await firstValueFrom(
        this.http.post<InternamientoMascota>(`${this.apiUrl}/internamientos/${internamientoId}/evoluciones`, {
          internamientoId,
          ...datos,
        })
      );
      this.reemplazar(actualizado);
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }

  async darAlta(id: string, fechaAlta: string): Promise<void> {
    try {
      const actualizado = await firstValueFrom(
        this.http.post<InternamientoMascota>(`${this.apiUrl}/internamientos/${id}/alta`, { id, fechaAlta })
      );
      this.reemplazar(actualizado);
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }

  private reemplazar(internamiento: InternamientoMascota): void {
    this._internamientos.update((lista) =>
      lista.map((item) => (item.id === internamiento.id ? internamiento : item))
    );
  }
}
