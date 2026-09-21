import { Component, computed, inject, signal } from '@angular/core';
import { CitasService } from '../../services/citas-service';
import { RecetasService } from '../../services/recetas-service';

@Component({
  imports: [],
  selector: 'app-recetas',
  styleUrl: './recetas.css',
  templateUrl: './recetas.html',
})
export class Recetas {
  private readonly citasService = inject(CitasService);
  private readonly recetasService = inject(RecetasService);

  protected readonly busqueda = signal('');

  protected readonly recetas = computed(() =>
    [...this.recetasService.recetas()]
      .sort((a, b) =>
        b.fechaEmision.localeCompare(a.fechaEmision)
      )
      .filter((receta) => {
        const texto = this.busqueda().trim().toLowerCase();

        if (!texto) {
          return true;
        }

        const mascota = this.citasService.obtenerMascota(
          receta.mascotaId
        );

        return (
          mascota?.nombre.toLowerCase().includes(texto) ||
          receta.medicamentos.some((medicamento) =>
            medicamento.nombre.toLowerCase().includes(texto)
          )
        );
      })
  );

  protected nombreMascota(id: string): string {
    return this.citasService.obtenerMascota(id)?.nombre ?? 'Mascota';
  }

  protected cambiarBusqueda(evento: Event): void {
    this.busqueda.set(
      (evento.target as HTMLInputElement).value
    );
  }

  protected estaFinalizada(fechaFin: string): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fin = new Date(`${fechaFin}T00:00:00`);

    return fin < hoy;
  }

  protected formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${fecha}T00:00:00Z`));
  }
}