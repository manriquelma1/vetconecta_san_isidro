import { Component, computed, inject, signal } from '@angular/core';
import { CitasService } from '../../services/citas-service';
import { HistorialService } from '../../services/historial-service';
import { Vacuna } from '../../models/historial-medico';
import { fechaLegible } from '../../utils/fecha';

@Component({
  imports: [],
  selector: 'app-recordatorios',
  styleUrl: './recordatorios.css',
  templateUrl: './recordatorios.html',
})
export class Recordatorios {
  private readonly citasService = inject(CitasService);
  private readonly historialService = inject(HistorialService);
  protected readonly error = signal('');

  // Las vacunas de todas las mascotas se piden una vez al entrar a la pagina
  // (el backend ya no las tiene todas en memoria como en la version localStorage).
  private readonly vacunas = signal<Vacuna[]>([]);

  constructor() {
    this.historialService.cargarTodasLasVacunas().then((vacunas) => this.vacunas.set(vacunas));
  }

  protected readonly recordatorios = computed(() =>
    this.citasService
      .citasOrdenadas()
      .filter((cita) =>
        cita.estado === 'Pendiente' &&
        this.fechaHoraCita(cita.fecha, cita.hora).getTime() >= Date.now()
      )
  );

  protected readonly refuerzos = computed(() =>
    this.vacunas()
      .filter((vacuna) => {
        const dias = this.diasHastaFecha(vacuna.proximaDosis);
        return dias <= 30;
      })
      .sort((a, b) => a.proximaDosis.localeCompare(b.proximaDosis))
  );

  protected readonly totalPendientes = computed(
    () => this.recordatorios().length + this.refuerzos().length
  );

  protected readonly fechaLegible = fechaLegible;

  protected nombreMascota(mascotaId: string): string {
    return this.citasService.obtenerMascota(mascotaId)?.nombre ?? 'Mascota';
  }

  protected horasRestantes(fecha: string, hora: string): number {
    const destino = this.fechaHoraCita(fecha, hora);
    return Math.ceil((destino.getTime() - Date.now()) / 3600000);
  }

  protected dentroDe24Horas(fecha: string, hora: string): boolean {
    const horas = this.horasRestantes(fecha, hora);
    return horas >= 0 && horas <= 24;
  }

  protected textoTiempo(fecha: string, hora: string): string {
    const horas = this.horasRestantes(fecha, hora);

    if (horas <= 0) {
      return 'Ahora';
    }

    if (horas <= 1) {
      return 'En menos de 1 hora';
    }

    if (horas <= 24) {
      return `En ${horas} horas`;
    }

    const dias = Math.ceil(horas / 24);

    if (dias === 1) {
      return 'Mañana';
    }

    return `En ${dias} días`;
  }

  protected textoRefuerzo(fecha: string): string {
    const dias = this.diasHastaFecha(fecha);

    if (dias < 0) {
      return `Vencida hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? '' : 's'}`;
    }

    if (dias === 0) {
      return 'Refuerzo hoy';
    }

    if (dias === 1) {
      return 'Refuerzo mañana';
    }

    return `Refuerzo en ${dias} días`;
  }

  protected refuerzoVencido(fecha: string): boolean {
    return this.diasHastaFecha(fecha) < 0;
  }

  protected async cancelar(id: string): Promise<void> {
    if (!window.confirm('¿Cancelar esta cita?')) return;
    this.error.set((await this.citasService.cambiarEstado(id, 'Cancelada')) ?? '');
  }

  private fechaHoraCita(fecha: string, hora: string): Date {
    return new Date(`${fecha}T${hora}:00`);
  }

  private diasHastaFecha(fecha: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const destino = new Date(`${fecha}T00:00:00`);
    destino.setHours(0, 0, 0, 0);

    return Math.ceil(
      (destino.getTime() - hoy.getTime()) / 86400000
    );
  }
}
