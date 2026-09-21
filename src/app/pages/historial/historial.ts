import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cita } from '../../models/cita';
import { CitasService } from '../../services/citas-service';
import { aClave, claveHoy, enAmPm, fechaLegible } from '../../utils/fecha';

/** Visitas que se muestran antes de pulsar "Cargar mas historial". */
const VISITAS_POR_PAGINA = 3;

const SERVICIOS = ['Consulta general', 'Vacunación', 'Cirugía menor', 'Peluquería', 'Emergencia'];

@Component({
  imports: [RouterLink],
  selector: 'app-historial',
  styleUrl: './historial.css',
  templateUrl: './historial.html',
})
export class Historial {
  private readonly citasService = inject(CitasService);

  protected readonly servicios = SERVICIOS;

  protected readonly mascotaId = signal(this.citasService.mascotas()[0]?.id ?? '');
  protected readonly busqueda = signal('');
  protected readonly limite = signal(VISITAS_POR_PAGINA);

  protected readonly enAmPm = enAmPm;
  protected readonly fechaLegible = fechaLegible;

  /** Una visita pasada no puede ser de hoy ni del futuro: el tope es ayer. */
  protected readonly ayer = aClave(new Date(Date.now() - 86_400_000));

  // --- Formulario de registro de visita pasada ---
  protected readonly mostrarFormulario = signal(false);
  protected readonly fFecha = signal('');
  protected readonly fHora = signal('');
  protected readonly fServicio = signal(SERVICIOS[0]);
  protected readonly fVeterinario = signal('');
  protected readonly fNotas = signal('');
  protected readonly error = signal('');

  /** Mascotas que coinciden con el buscador (por nombre o propietario). */
  protected readonly mascotasFiltradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const mascotas = this.citasService.mascotas();
    if (!texto) return mascotas;
    return mascotas.filter(
      (mascota) =>
        mascota.nombre.toLowerCase().includes(texto) ||
        (mascota.propietario ?? '').toLowerCase().includes(texto),
    );
  });

  protected readonly mascota = computed(
    () => this.citasService.mascotas().find((m) => m.id === this.mascotaId()) ?? null,
  );

  /** Todas las visitas pasadas de la mascota seleccionada. */
  private readonly visitasDeLaMascota = computed(() =>
    this.citasService.citasPasadas().filter((cita) => cita.mascotaId === this.mascotaId()),
  );

  protected readonly visitas = computed(() => this.visitasDeLaMascota().slice(0, this.limite()));

  protected readonly hayMasVisitas = computed(
    () => this.visitasDeLaMascota().length > this.limite(),
  );

  /** Badge de la tarjeta: refleja si tiene alguna cita por delante. */
  protected readonly tieneCitaProxima = computed(() =>
    this.citasService.citasProximas().some((cita) => cita.mascotaId === this.mascotaId()),
  );

  protected seleccionar(id: string): void {
    this.mascotaId.set(id);
    this.limite.set(VISITAS_POR_PAGINA);
  }

  protected escribirBusqueda(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  protected cargarMas(): void {
    this.limite.update((actual) => actual + VISITAS_POR_PAGINA);
  }

  protected abrirFormulario(): void {
    this.fFecha.set('');
    this.fHora.set('');
    this.fServicio.set(SERVICIOS[0]);
    this.fVeterinario.set('');
    this.fNotas.set('');
    this.error.set('');
    this.mostrarFormulario.set(true);
  }

  protected registrarVisita(): void {
    const paciente = this.mascota();
    if (!paciente) return;

    if (!this.fFecha()) {
      this.error.set('Indica la fecha de la visita.');
      return;
    }
    if (this.fFecha() >= claveHoy()) {
      this.error.set('Una visita pasada debe tener una fecha anterior a hoy.');
      return;
    }
    if (!this.fHora()) {
      this.error.set('Indica la hora de la visita.');
      return;
    }

    this.citasService.agregarCita({
      mascotaId: paciente.id,
      mascotaNombre: paciente.nombre,
      servicio: this.fServicio(),
      fecha: this.fFecha(),
      hora: this.fHora(),
      veterinario: this.fVeterinario().trim() || undefined,
      notas: this.fNotas().trim() || undefined,
    });

    this.mostrarFormulario.set(false);
    this.limite.set(VISITAS_POR_PAGINA);
  }

  protected eliminarVisita(visita: Cita): void {
    this.citasService.eliminarCita(visita.id);
  }

  protected escribir(destino: 'fFecha' | 'fHora' | 'fServicio' | 'fVeterinario' | 'fNotas', evento: Event): void {
    const valor = (evento.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    this[destino].set(valor);
    this.error.set('');
  }

  protected inicial(nombre: string): string {
    return nombre.charAt(0).toUpperCase();
  }
}
