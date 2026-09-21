export interface Producto {
  id: number;
  nombre: string;
  categoria: 'Farmacia' | 'Pet Shop';
  precio: number;
  stock: number;
  stockMinimo: number;
}
