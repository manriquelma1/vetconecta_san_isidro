export interface Producto {
  id: string;
  nombre: string;
  categoria: 'Farmacia' | 'Pet Shop';
  precio: number;
  stock: number;
  stockMinimo: number;
}
