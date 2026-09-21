import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CitasService } from '../../services/citas-service';
import { claveHoy, enAmPm, fechaLegible } from '../../utils/fecha';

/** Cuantas citas proximas se listan en el dashboard. */
const MAXIMO_EN_LISTA = 4;

@Component({
  imports: [RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly citasService = inject(CitasService);

  private readonly hoy = claveHoy();

  protected readonly citasDeHoy = this.citasService.citasDeHoy;

  protected readonly proximas = computed(() =>
    this.citasService.citasProximas().slice(0, MAXIMO_EN_LISTA),
  );

  protected readonly enAmPm = enAmPm;

  /** "Hoy" para las citas del dia, la fecha completa para el resto. */
  protected etiquetaFecha(fecha: string): string {
    return fecha === this.hoy ? 'Hoy' : fechaLegible(fecha);
  }
}
