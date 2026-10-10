import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Producto } from '../models/producto';
import { extraerMensajeError } from '../utils/http-error';
import { environment } from '../../environments/environment';

/** Solo personal de farmacia (HU-10): el backend ya rechaza todo esto a un propietario. */
@Injectable({
  providedIn: 'root'
})
export class Inventario {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  async obtenerProductos(): Promise<Producto[]> {
    try {
      return await firstValueFrom(this.http.get<Producto[]>(`${this.apiUrl}/productos`));
    } catch {
      return [];
    }
  }

  async buscarProductos(texto: string): Promise<Producto[]> {
    try {
      return await firstValueFrom(
        this.http.get<Producto[]>(`${this.apiUrl}/productos`, { params: { texto } })
      );
    } catch {
      return [];
    }
  }

  /** Lanza un Error con el mensaje del backend si no hay stock (o no hay permiso). */
  async venderProducto(id: string, cantidad = 1): Promise<Producto> {
    try {
      return await firstValueFrom(
        this.http.post<Producto>(`${this.apiUrl}/productos/${id}/vender`, cantidad)
      );
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }

  tieneStockBajo(producto: Producto): boolean {
    return producto.stock <= producto.stockMinimo;
  }
}
