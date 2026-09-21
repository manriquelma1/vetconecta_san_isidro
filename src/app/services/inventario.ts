import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class Inventario {

  private productos: Producto[] = [
    {
      id: 1,
      nombre: 'NexGard Spectra',
      categoria: 'Farmacia',
      precio: 65.00,
      stock: 12,
      stockMinimo: 5
    },
    {
      id: 2,
      nombre: 'Shampoo medicado Oti-Soothe',
      categoria: 'Pet Shop',
      precio: 42.90,
      stock: 8,
      stockMinimo: 3
    },
    {
      id: 3,
      nombre: 'Royal Canin Gastrointestinal',
      categoria: 'Pet Shop',
      precio: 89.90,
      stock: 3,
      stockMinimo: 5
    },
    {
      id: 4,
      nombre: 'Amoxicilina 500 mg',
      categoria: 'Farmacia',
      precio: 35.50,
      stock: 10,
      stockMinimo: 4
    },
    {
      id: 5,
      nombre: 'Meloxicam suspensión',
      categoria: 'Farmacia',
      precio: 28.00,
      stock: 2,
      stockMinimo: 3
    }
  ];

  obtenerProductos(): Producto[] {
    return this.productos;
  }

  buscarProductos(texto: string): Producto[] {
    const termino = texto.trim().toLowerCase();

    if (!termino) {
      return this.productos;
    }

    return this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(termino)
    );
  }

  venderProducto(id: number, cantidad: number = 1): boolean {
    const producto = this.productos.find(item => item.id === id);

    if (!producto || cantidad <= 0 || producto.stock < cantidad) {
      return false;
    }

    producto.stock -= cantidad;
    return true;
  }

  tieneStockBajo(producto: Producto): boolean {
    return producto.stock <= producto.stockMinimo;
  }
}