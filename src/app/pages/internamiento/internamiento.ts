import { Component, computed, inject, signal } from '@angular/core';
import { CitasService } from '../../services/citas-service';
import { InternamientoService } from '../../services/internamiento-service';

@Component({
  imports: [],
  selector: 'app-internamiento',
  styleUrl: './internamiento.css',
  templateUrl: './internamiento.html',
})
export class Internamiento {
  private readonly citasService = inject(CitasService);
  private readonly internamientoService = inject(InternamientoService);

  protected readonly internamientos =
    this.internamientoService.internamientos;

  protected readonly internamientoSeleccionadoId = signal(
    this.internamientoService.internamientos()[0]?.id ?? ''
  );

  protected readonly editandoSignos = signal(false);
  protected readonly temperatura = signal('');
  protected readonly frecuenciaCardiaca = signal('');
  protected readonly frecuenciaRespiratoria = signal('');
  protected readonly mensaje = signal<{
    texto: string;
    error: boolean;
  } | null>(null);

  protected readonly internamientoSeleccionado = computed(() =>
    this.internamientoService.obtener(
      this.internamientoSeleccionadoId()
    )
  );

  protected readonly mascotaSeleccionada = computed(() => {
    const internamiento = this.internamientoSeleccionado();

    if (!internamiento) {
      return undefined;
    }

    return this.citasService.obtenerMascota(
      internamiento.mascotaId
    );
  });

  protected seleccionarInternamiento(id: string): void {
    this.internamientoSeleccionadoId.set(id);
    this.editandoSignos.set(false);
    this.mensaje.set(null);
  }

  protected comenzarActualizarSignos(): void {
    const internamiento = this.internamientoSeleccionado();

    if (!internamiento) {
      return;
    }

    this.temperatura.set(String(internamiento.temperatura));
    this.frecuenciaCardiaca.set(
      String(internamiento.frecuenciaCardiaca)
    );
    this.frecuenciaRespiratoria.set(
      String(internamiento.frecuenciaRespiratoria)
    );

    this.editandoSignos.set(true);
    this.mensaje.set(null);
  }

  protected cancelarActualizacion(): void {
    this.editandoSignos.set(false);
    this.mensaje.set(null);
  }

  protected cambiarTemperatura(evento: Event): void {
    this.temperatura.set(
      (evento.target as HTMLInputElement).value
    );
  }

  protected cambiarFrecuenciaCardiaca(evento: Event): void {
    this.frecuenciaCardiaca.set(
      (evento.target as HTMLInputElement).value
    );
  }

  protected cambiarFrecuenciaRespiratoria(evento: Event): void {
    this.frecuenciaRespiratoria.set(
      (evento.target as HTMLInputElement).value
    );
  }

  protected guardarSignos(): void {
    const internamiento = this.internamientoSeleccionado();
    const temperatura = Number(this.temperatura());
    const frecuenciaCardiaca = Number(
      this.frecuenciaCardiaca()
    );
    const frecuenciaRespiratoria = Number(
      this.frecuenciaRespiratoria()
    );

    if (!internamiento) {
      return;
    }

    if (
      !Number.isFinite(temperatura) ||
      temperatura <= 0
    ) {
      this.mensaje.set({
        texto: 'Ingresa una temperatura válida.',
        error: true
      });
      return;
    }

    if (
      !Number.isFinite(frecuenciaCardiaca) ||
      frecuenciaCardiaca <= 0
    ) {
      this.mensaje.set({
        texto: 'Ingresa una frecuencia cardíaca válida.',
        error: true
      });
      return;
    }

    if (
      !Number.isFinite(frecuenciaRespiratoria) ||
      frecuenciaRespiratoria <= 0
    ) {
      this.mensaje.set({
        texto: 'Ingresa una frecuencia respiratoria válida.',
        error: true
      });
      return;
    }

    this.internamientoService.actualizarSignos(
      internamiento.id,
      temperatura,
      frecuenciaCardiaca,
      frecuenciaRespiratoria
    );

    this.editandoSignos.set(false);

    this.mensaje.set({
      texto: 'Signos vitales actualizados correctamente.',
      error: false
    });
  }

  protected cambiarTratamiento(
    tratamientoId: string,
    evento: Event
  ): void {
    const internamiento = this.internamientoSeleccionado();

    if (!internamiento) {
      return;
    }

    const realizado =
      (evento.target as HTMLInputElement).checked;

    this.internamientoService.cambiarEstadoTratamiento(
      internamiento.id,
      tratamientoId,
      realizado
    );
  }
}