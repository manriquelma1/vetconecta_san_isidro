import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { CitasService } from '../../services/citas-service';
import { RecetasService } from '../../services/recetas-service';

interface MedicamentoBorrador {
  nombre: string;
  dosis: string;
  duracion: string;
}

function medicamentoVacio(): MedicamentoBorrador {
  return { nombre: '', dosis: '', duracion: '' };
}

/** Fecha de hoy en formato YYYY-MM-DD, en zona horaria local. */
function claveHoy(): string {
  const hoy = new Date();
  const mes = `${hoy.getMonth() + 1}`.padStart(2, '0');
  const dia = `${hoy.getDate()}`.padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

@Component({
  imports: [],
  selector: 'app-recetas',
  styleUrl: './recetas.css',
  templateUrl: './recetas.html',
})
export class Recetas {
  private readonly citasService = inject(CitasService);
  private readonly recetasService = inject(RecetasService);
  private readonly auth = inject(AuthService);

  protected readonly busqueda = signal('');
  protected readonly esPersonal = this.auth.esPersonal;
  protected readonly mascotas = this.citasService.mascotas;

  // --- Formulario de emision de receta (solo personal) ---
  protected readonly mostrarForm = signal(false);
  protected readonly fMascotaId = signal('');
  protected readonly fVeterinario = signal('');
  protected readonly fEmision = signal('');
  protected readonly fFin = signal('');
  protected readonly fMedicamentos = signal<MedicamentoBorrador[]>([medicamentoVacio()]);
  protected readonly errorReceta = signal('');
  protected readonly aviso = signal('');

  private readonly dialogoReceta = viewChild<ElementRef<HTMLDialogElement>>('dialogoReceta');

  constructor() {
    // Abre y cierra el <dialog> nativo siguiendo a la senal.
    effect(() => {
      const dialogo = this.dialogoReceta()?.nativeElement;

      if (!dialogo) {
        return;
      }

      if (this.mostrarForm()) {
        if (!dialogo.open) dialogo.showModal();
      } else if (dialogo.open) {
        dialogo.close();
      }
    });
  }

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

  protected abrirForm(): void {
    this.fMascotaId.set(this.mascotas()[0]?.id ?? '');
    this.fVeterinario.set(this.auth.usuario()?.nombre ?? '');
    this.fEmision.set(claveHoy());
    this.fFin.set('');
    this.fMedicamentos.set([medicamentoVacio()]);
    this.errorReceta.set('');
    this.mostrarForm.set(true);
  }

  /** El <dialog> nativo no cierra al pulsar el fondo: el clic se reporta sobre el propio dialogo. */
  protected cerrarSiFondo(evento: MouseEvent): void {
    if (evento.target === this.dialogoReceta()?.nativeElement) {
      this.mostrarForm.set(false);
    }
  }

  protected cambiarCampo(
    destino: 'fMascotaId' | 'fVeterinario' | 'fEmision' | 'fFin',
    evento: Event,
  ): void {
    this[destino].set((evento.target as HTMLInputElement | HTMLSelectElement).value);
    this.errorReceta.set('');
  }

  protected agregarMedicamento(): void {
    this.fMedicamentos.update((lista) => [...lista, medicamentoVacio()]);
  }

  protected quitarMedicamento(indice: number): void {
    // Siempre queda al menos una fila: una receta sin medicamentos no tiene sentido.
    this.fMedicamentos.update((lista) =>
      lista.length > 1 ? lista.filter((_, i) => i !== indice) : lista
    );
  }

  protected cambiarMedicamento(
    indice: number,
    campo: keyof MedicamentoBorrador,
    evento: Event,
  ): void {
    const valor = (evento.target as HTMLInputElement).value;

    this.fMedicamentos.update((lista) =>
      lista.map((medicamento, i) =>
        i === indice ? { ...medicamento, [campo]: valor } : medicamento
      )
    );

    this.errorReceta.set('');
  }

  protected guardarReceta(): void {
    const mascotaId = this.fMascotaId();
    const veterinario = this.fVeterinario().trim();
    const fechaEmision = this.fEmision();
    const fechaFin = this.fFin();

    if (!mascotaId) {
      this.errorReceta.set('Selecciona la mascota.');
      return;
    }

    if (!veterinario) {
      this.errorReceta.set('Indica el veterinario que emite la receta.');
      return;
    }

    if (!fechaEmision) {
      this.errorReceta.set('Indica la fecha de emisión.');
      return;
    }

    if (!fechaFin) {
      this.errorReceta.set('Indica la fecha de fin del tratamiento.');
      return;
    }

    if (fechaFin < fechaEmision) {
      this.errorReceta.set('El fin del tratamiento no puede ser anterior a la emisión.');
      return;
    }

    const medicamentos = this.fMedicamentos()
      .map((medicamento) => ({
        nombre: medicamento.nombre.trim(),
        dosis: medicamento.dosis.trim(),
        duracion: medicamento.duracion.trim()
      }))
      .filter((medicamento) => medicamento.nombre || medicamento.dosis || medicamento.duracion);

    if (!medicamentos.length) {
      this.errorReceta.set('Agrega al menos un medicamento.');
      return;
    }

    const incompleto = medicamentos.some(
      (medicamento) => !medicamento.nombre || !medicamento.dosis || !medicamento.duracion
    );

    if (incompleto) {
      this.errorReceta.set('Cada medicamento necesita nombre, dosis y duración.');
      return;
    }

    const receta = this.recetasService.agregarReceta({
      mascotaId,
      veterinario,
      fechaEmision,
      fechaFin,
      medicamentos: medicamentos.map((medicamento) => ({ ...medicamento, id: '' }))
    });

    if (!receta) {
      this.errorReceta.set('Solo el personal veterinario puede emitir recetas.');
      return;
    }

    this.mostrarForm.set(false);
    this.busqueda.set('');
    this.aviso.set(`Receta emitida para ${this.nombreMascota(receta.mascotaId)}.`);
  }

  protected eliminarReceta(id: string): void {
    this.recetasService.eliminarReceta(id);
    this.aviso.set('La receta se eliminó.');
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