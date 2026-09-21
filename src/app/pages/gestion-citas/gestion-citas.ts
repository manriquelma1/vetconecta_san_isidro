import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Cita, EstadoCita, ESTADOS_CITA } from '../../models/cita';
import { CitasService } from '../../services/citas-service';
import { claveHoy } from '../../utils/fecha';

@Component({
  selector: 'app-gestion-citas',
  imports: [DatePipe],
  templateUrl: './gestion-citas.html',
  styleUrl: './gestion-citas.css',
})
export class GestionCitas {
  private readonly citasService = inject(CitasService);

  protected readonly estados = ESTADOS_CITA;
  protected readonly fecha = signal(claveHoy());
  protected readonly mensaje = signal<{ texto: string; error: boolean } | null>(null);
  protected readonly citas = computed(() => {
    const fecha = this.fecha();
    return this.citasService.citasOrdenadas().filter((cita) => !fecha || cita.fecha === fecha);
  });
  protected readonly pendientes = computed(() => this.citas().filter((cita) => cita.estado === 'Pendiente').length);
  protected readonly atendidas = computed(() => this.citas().filter((cita) => cita.estado === 'Atendida').length);
  protected readonly canceladas = computed(() => this.citas().filter((cita) => cita.estado === 'Cancelada').length);

  protected filtrarFecha(evento: Event): void {
    this.fecha.set((evento.target as HTMLInputElement).value);
    this.mensaje.set(null);
  }

  protected verHoy(): void {
    this.fecha.set(claveHoy());
    this.mensaje.set(null);
  }

  protected verTodas(): void {
    this.fecha.set('');
    this.mensaje.set(null);
  }

  protected cambiarEstado(cita: Cita, evento: Event): void {
    const selector = evento.target as HTMLSelectElement;
    const estado = selector.value as EstadoCita;
    if (estado === cita.estado) return;
    this.mensaje.set(null);

    if (estado === 'Cancelada' && !window.confirm(`\u00bfCancelar la cita de ${cita.mascotaNombre}?`)) {
      selector.value = cita.estado;
      return;
    }

    const error = this.citasService.cambiarEstado(cita.id, estado);
    if (error) {
      selector.value = cita.estado;
      this.mensaje.set({ texto: error, error: true });
      return;
    }

    this.mensaje.set({ texto: `Cita de ${cita.mascotaNombre} actualizada: ${estado}.`, error: false });
  }
}
