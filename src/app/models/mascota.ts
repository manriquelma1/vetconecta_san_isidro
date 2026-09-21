export interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  peso: number;
  alergias: string;
  foto: string | null;
}