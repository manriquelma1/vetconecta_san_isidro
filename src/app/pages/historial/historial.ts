import { Component, computed, inject, signal } from '@angular/core';
import { CitasService } from '../../services/citas-service';
import { HistorialService } from '../../services/historial-service';

@Component({
  imports: [RouterLink],
  selector: 'app-historial',
  styleUrl: './historial.css',
  templateUrl: './historial.html',
})
export class Historial {
  private readonly citasService = inject(CitasService);
  private readonly historialService = inject(HistorialService);

  readonly mascotas = this.citasService.mascotas;

  readonly mascotaSeleccionadaId = signal(
    this.citasService.mascotas()[0]?.id ?? ''
  );

  readonly busqueda = signal('');

  readonly mascotaSeleccionada = computed(() =>
    this.citasService.obtenerMascota(
      this.mascotaSeleccionadaId()
    )
  );

  readonly mascotasFiltradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();

    if (!texto) {
      return this.mascotas();
    }

    return this.mascotas().filter((mascota) =>
      mascota.nombre.toLowerCase().includes(texto)
    );
  });

  readonly vacunas = computed(() =>
    this.historialService.vacunasDeMascota(
      this.mascotaSeleccionadaId()
    )
  );

  readonly visitas = computed(() =>
    this.historialService.visitasDeMascota(
      this.mascotaSeleccionadaId()
    )
  );

  seleccionarMascota(id: string): void {
    this.mascotaSeleccionadaId.set(id);
  }

  cambiarBusqueda(evento: Event): void {
    this.busqueda.set(
      (evento.target as HTMLInputElement).value
    );
  }

  formatearFecha(fecha: string): string {
    if (!fecha) {
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${fecha}T00:00:00Z`));
  }
}