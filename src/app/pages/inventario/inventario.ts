import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';
import { Inventario as InventarioService } from '../../services/inventario';

@Component({
  selector: 'app-inventario',
  imports: [FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class Inventario {

  private inventarioService = inject(InventarioService);

  terminoBusqueda = '';
  productos = signal<Producto[]>([]);

  mensaje = '';
  mensajeError = false;

  constructor() {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    this.productos.set(await this.inventarioService.obtenerProductos());
  }

  async buscar(): Promise<void> {
    this.productos.set(await this.inventarioService.buscarProductos(this.terminoBusqueda));
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.mensaje = '';
    this.cargar();
  }

  async vender(producto: Producto): Promise<void> {
    try {
      const actualizado = await this.inventarioService.venderProducto(producto.id, 1);

      this.productos.update((lista) =>
        lista.map((item) => (item.id === actualizado.id ? actualizado : item))
      );

      this.mensaje = `Venta registrada: ${actualizado.nombre}. Stock actualizado: ${actualizado.stock}.`;
      this.mensajeError = false;
    } catch (error) {
      this.mensaje = error instanceof Error ? error.message : `No hay stock disponible para ${producto.nombre}.`;
      this.mensajeError = true;
    }
  }

  stockBajo(producto: Producto): boolean {
    return this.inventarioService.tieneStockBajo(producto);
  }
}
