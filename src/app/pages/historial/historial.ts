import { Component, computed, effect, inject, signal } from '@angular/core';
import { CitasService } from '../../services/citas-service';
import { HistorialService } from '../../services/historial-service';

@Component({
  imports: [],
  selector: 'app-historial',
  styleUrl: './historial.css',
  templateUrl: './historial.html',
})
export class Historial {
  private readonly citasService = inject(CitasService);
  private readonly historialService = inject(HistorialService);

  readonly mascotas = this.citasService.mascotas;

  // Las mascotas llegan por HTTP: vacio al construir, se elige la primera en el effect() de abajo.
  readonly mascotaSeleccionadaId = signal('');

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

  constructor() {
    // Selecciona la primera mascota apenas la lista llega del backend.
    effect(() => {
      const [primeraMascota] = this.mascotas();

      if (primeraMascota && !this.mascotaSeleccionadaId()) {
        this.mascotaSeleccionadaId.set(primeraMascota.id);
      }
    });

    // Pide el historial (vacunas + visitas) cada vez que cambia la mascota elegida.
    effect(() => {
      const id = this.mascotaSeleccionadaId();

      if (id) {
        this.historialService.cargarHistorial(id);
      }
    });
  }

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
