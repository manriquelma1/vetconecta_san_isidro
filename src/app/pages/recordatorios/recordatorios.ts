import { Component, computed, inject } from '@angular/core';
import { CitasService } from '../../services/citas-service';
import { fechaLegible } from '../../utils/fecha';

@Component({
  imports: [],
  selector: 'app-recordatorios',
  styleUrl: './recordatorios.css',
  templateUrl: './recordatorios.html',
})
export class Recordatorios {
  private readonly citasService = inject(CitasService);

  protected readonly recordatorios = computed(() =>
    this.citasService.citasProximas()
  );

  protected readonly fechaLegible = fechaLegible;

  protected diasRestantes(fecha: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const destino = new Date(`${fecha}T00:00:00`);
    destino.setHours(0, 0, 0, 0);

    return Math.ceil(
      (destino.getTime() - hoy.getTime()) / 86400000
    );
  }

  protected textoTiempo(fecha: string): string {
    const dias = this.diasRestantes(fecha);

    if (dias === 0) {
      return 'Hoy';
    }

    if (dias === 1) {
      return 'Mañana';
    }

    return `En ${dias} días`;
  }

  protected cancelar(id: string): void {
    this.citasService.cambiarEstado(id, 'Cancelada');
  }
}