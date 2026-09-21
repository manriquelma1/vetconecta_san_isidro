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
  protected readonly mostrandoEvolucion = signal(false);
  protected readonly temperatura = signal('');
  protected readonly frecuenciaCardiaca = signal('');
  protected readonly frecuenciaRespiratoria = signal('');
  protected readonly notaEvolucion = signal('');
  protected readonly veterinarioEvolucion = signal('');

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

  protected readonly evolucionesOrdenadas = computed(() => {
    const internamiento = this.internamientoSeleccionado();

    if (!internamiento) {
      return [];
    }

    return [...(internamiento.evoluciones ?? [])].sort(
      (a, b) =>
        `${b.fecha}${b.hora}`.localeCompare(
          `${a.fecha}${a.hora}`
        )
    );
  });

  protected seleccionarInternamiento(id: string): void {
    this.internamientoSeleccionadoId.set(id);
    this.editandoSignos.set(false);
    this.mostrandoEvolucion.set(false);
    this.mensaje.set(null);
  }

  protected comenzarActualizarSignos(): void {
    const internamiento = this.internamientoSeleccionado();

    if (!internamiento || internamiento.estado === 'Alta') {
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

  protected abrirEvolucion(): void {
    if (this.internamientoSeleccionado()?.estado === 'Alta') {
      return;
    }

    this.notaEvolucion.set('');
    this.veterinarioEvolucion.set('');
    this.mostrandoEvolucion.set(true);
    this.mensaje.set(null);
  }

  protected cerrarEvolucion(): void {
    this.mostrandoEvolucion.set(false);
    this.mensaje.set(null);
  }

  protected cambiarNotaEvolucion(evento: Event): void {
    this.notaEvolucion.set(
      (evento.target as HTMLTextAreaElement).value
    );
  }

  protected cambiarVeterinario(evento: Event): void {
    this.veterinarioEvolucion.set(
      (evento.target as HTMLInputElement).value
    );
  }

  protected guardarEvolucion(): void {
    const internamiento = this.internamientoSeleccionado();
    const nota = this.notaEvolucion().trim();
    const veterinario = this.veterinarioEvolucion().trim();

    if (!internamiento) {
      return;
    }

    if (!nota) {
      this.mensaje.set({
        texto: 'Ingresa la nota de evolución.',
        error: true
      });
      return;
    }

    if (!veterinario) {
      this.mensaje.set({
        texto: 'Ingresa el nombre del veterinario.',
        error: true
      });
      return;
    }

    const ahora = new Date();

    this.internamientoService.agregarEvolucion(
      internamiento.id,
      {
        fecha: this.fechaLocal(ahora),
        hora: ahora.toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        nota,
        veterinario
      }
    );

    this.mostrandoEvolucion.set(false);

    this.mensaje.set({
      texto: 'Evolución registrada correctamente.',
      error: false
    });
  }

  protected darAlta(): void {
    const internamiento = this.internamientoSeleccionado();

    if (!internamiento || internamiento.estado === 'Alta') {
      return;
    }

    this.internamientoService.darAlta(
      internamiento.id,
      this.fechaLocal(new Date())
    );

    this.editandoSignos.set(false);
    this.mostrandoEvolucion.set(false);

    this.mensaje.set({
      texto: 'El paciente fue dado de alta correctamente.',
      error: false
    });
  }

  protected cambiarTratamiento(
    tratamientoId: string,
    evento: Event
  ): void {
    const internamiento = this.internamientoSeleccionado();

    if (!internamiento || internamiento.estado === 'Alta') {
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

  protected formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${fecha}T00:00:00Z`));
  }

  private fechaLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }
}