import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Receta } from '../models/receta';
import { extraerMensajeError } from '../utils/http-error';
import { environment } from '../../environments/environment';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class RecetasService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  private readonly _recetas = signal<Receta[]>([]);

  readonly recetas = this._recetas.asReadonly();

  constructor() {
    effect(() => {
      if (this.auth.autenticado()) {
        this.cargarRecetas();
      } else {
        this._recetas.set([]);
      }
    });
  }

  async cargarRecetas(): Promise<void> {
    try {
      const recetas = await firstValueFrom(this.http.get<Receta[]>(`${this.apiUrl}/recetas`));
      this._recetas.set(recetas);
    } catch {
      // Sin donde mostrar el error en este punto: el componente ya maneja su propio estado vacio.
    }
  }

  /**
   * Emite una receta. Solo el personal veterinario puede recetar:
   * el backend responde 401 si quien tiene la sesion abierta no lo es.
   */
  async agregarReceta(datos: Omit<Receta, 'id'>): Promise<Receta> {
    try {
      const receta = await firstValueFrom(this.http.post<Receta>(`${this.apiUrl}/recetas`, datos));
      this._recetas.update((lista) => [receta, ...lista]);
      return receta;
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }

  async eliminarReceta(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/recetas/${id}`));
      this._recetas.update((lista) => lista.filter((receta) => receta.id !== id));
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }
}
