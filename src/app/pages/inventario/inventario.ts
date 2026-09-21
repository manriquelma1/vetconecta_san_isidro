import { Component, inject } from '@angular/core';
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
  productos: Producto[] = this.inventarioService.obtenerProductos();

  mensaje = '';
  mensajeError = false;

  buscar(): void {
    this.productos =
      this.inventarioService.buscarProductos(this.terminoBusqueda);
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.productos = this.inventarioService.obtenerProductos();
    this.mensaje = '';
  }

  vender(producto: Producto): void {
    const ventaRealizada =
      this.inventarioService.venderProducto(producto.id, 1);

    if (ventaRealizada) {
      this.mensaje = `Venta registrada: ${producto.nombre}. Stock actualizado: ${producto.stock}.`;
      this.mensajeError = false;
    } else {
      this.mensaje = `No hay stock disponible para ${producto.nombre}.`;
      this.mensajeError = true;
    }
  }

  stockBajo(producto: Producto): boolean {
    return this.inventarioService.tieneStockBajo(producto);
  }
}