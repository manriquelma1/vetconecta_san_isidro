import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Cita } from '../../models/cita';
import { CitasService } from '../../services/citas-service';
import { NOMBRES_MES, aClave, fechaLegible } from '../../utils/fecha';
import { SERVICIOS } from '../../utils/servicios';

const HORARIOS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];

/** Mismas opciones que la ficha de Perfil. */
const ESPECIES = ['Perro', 'Gato', 'Conejo', 'Ave', 'Otro'];

interface Celda {
  numero: number;
  clave: string;
  fueraDeMes: boolean;
  pasado: boolean;
}

@Component({
  imports: [],
  selector: 'app-agendar',
  styleUrl: './agendar.css',
  templateUrl: './agendar.html',
})
export class Agendar {
  private readonly citasService = inject(CitasService);

  protected readonly servicios = SERVICIOS;
  protected readonly especies = ESPECIES;
  protected readonly mascotas = this.citasService.mascotas;
  protected readonly citas = this.citasService.citasOrdenadas;

  private readonly hoy = aClave(new Date());

  protected readonly mascotaId = signal(this.citasService.mascotas()[0]?.id ?? '');
  protected readonly servicio = signal(SERVICIOS[0]);
  protected readonly fecha = signal(this.hoy);
  protected readonly hora = signal('');
  protected readonly motivoConsulta = signal('');
  protected readonly mesVisible = signal(new Date());
  protected readonly busquedaMascota = signal('');

  // --- Ficha de la mascota nueva (mismos campos que Perfil) ---
  protected readonly mostrarFormMascota = signal(false);
  protected readonly nombre = signal('');
  protected readonly especie = signal('');
  protected readonly raza = signal('');
  protected readonly edad = signal('');
  protected readonly peso = signal('');
  protected readonly alergias = signal('');
  /** Error propio del dialogo: el de `mensaje` quedaria oculto detras del modal. */
  protected readonly errorMascota = signal('');
  protected readonly mensaje = signal<{ texto: string; error: boolean } | null>(null);

  private readonly dialogoMascota = viewChild<ElementRef<HTMLDialogElement>>('dialogoMascota');

  constructor() {
    // Abre y cierra el <dialog> nativo siguiendo a la senal.
    effect(() => {
      const dialogo = this.dialogoMascota()?.nativeElement;

      if (!dialogo) {
        return;
      }

      if (this.mostrarFormMascota()) {
        if (!dialogo.open) dialogo.showModal();
      } else if (dialogo.open) {
        dialogo.close();
      }
    });
  }

  /** Mascotas que coinciden con el buscador (por nombre, especie o raza). */
  protected readonly mascotasFiltradas = computed(() => {
    const texto = this.busquedaMascota().trim().toLowerCase();
    const mascotas = this.mascotas();

    if (!texto) {
      return mascotas;
    }

    return mascotas.filter((mascota) =>
      [mascota.nombre, mascota.especie, mascota.raza].some((campo) =>
        (campo ?? '').toLowerCase().includes(texto)
      )
    );
  });

  protected readonly mascotaSeleccionada = computed(() =>
    this.mascotas().find((mascota) => mascota.id === this.mascotaId()) ?? null
  );

  /** La mascota elegida puede quedar fuera del filtro: hay que avisarlo. */
  protected readonly seleccionadaOculta = computed(() => {
    const id = this.mascotaId();

    return !!id && !this.mascotasFiltradas().some((mascota) => mascota.id === id);
  });

  protected readonly tituloMes = computed(() => {
    const mes = this.mesVisible();
    return `${NOMBRES_MES[mes.getMonth()]} ${mes.getFullYear()}`;
  });

  protected readonly dias = computed<Celda[]>(() => {
    const visible = this.mesVisible();
    const anio = visible.getFullYear();
    const mes = visible.getMonth();
    const desfase = (new Date(anio, mes, 1).getDay() + 6) % 7;
    const ultimoDiaMesAnterior = new Date(anio, mes, 0).getDate();
    const totalDias = new Date(anio, mes + 1, 0).getDate();

    const celdas: Celda[] = [];

    for (let i = desfase; i > 0; i--) {
      celdas.push({
        numero: ultimoDiaMesAnterior - i + 1,
        clave: '',
        fueraDeMes: true,
        pasado: true
      });
    }

    for (let dia = 1; dia <= totalDias; dia++) {
      const clave = aClave(new Date(anio, mes, dia));

      celdas.push({
        numero: dia,
        clave,
        fueraDeMes: false,
        pasado: clave < this.hoy
      });
    }

    return celdas;
  });

  protected readonly horarios = computed(() => {
    const ocupadas = this.citasService.horasOcupadas(this.fecha());

    return HORARIOS.map((hora) => ({
      hora,
      ocupado: ocupadas.includes(hora)
    }));
  });

  protected escribirBusquedaMascota(evento: Event): void {
    this.busquedaMascota.set((evento.target as HTMLInputElement).value);
  }

  protected abrirFormMascota(): void {
    // Si busque una mascota que no existe, ese texto ya es el nombre que quiero dar de alta.
    this.nombre.set(this.busquedaMascota().trim());
    this.especie.set('');
    this.raza.set('');
    this.edad.set('');
    this.peso.set('');
    this.alergias.set('');
    this.errorMascota.set('');
    this.mostrarFormMascota.set(true);
  }

  /** El <dialog> nativo no cierra al pulsar el fondo: el clic se reporta sobre el propio dialogo. */
  protected cerrarSiFondo(evento: MouseEvent): void {
    if (evento.target === this.dialogoMascota()?.nativeElement) {
      this.mostrarFormMascota.set(false);
    }
  }

  protected cambiarCampoMascota(
    destino: 'nombre' | 'especie' | 'raza' | 'edad' | 'peso' | 'alergias',
    evento: Event,
  ): void {
    const valor = (evento.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
    this[destino].set(valor);
    this.errorMascota.set('');
  }

  protected seleccionarMascota(id: string): void {
    this.mascotaId.set(id);
    this.mensaje.set(null);
  }

  protected seleccionarServicio(evento: Event): void {
    this.servicio.set((evento.target as HTMLSelectElement).value);
    this.mensaje.set(null);
  }

  protected cambiarMotivo(evento: Event): void {
    this.motivoConsulta.set((evento.target as HTMLTextAreaElement).value);
    this.mensaje.set(null);
  }

  protected seleccionarDia(celda: Celda): void {
    if (celda.fueraDeMes || celda.pasado) {
      return;
    }

    this.fecha.set(celda.clave);
    this.hora.set('');
    this.mensaje.set(null);
  }

  protected seleccionarHora(hora: string): void {
    this.hora.set(hora);
    this.mensaje.set(null);
  }

  protected cambiarMes(delta: number): void {
    const visible = this.mesVisible();

    this.mesVisible.set(
      new Date(
        visible.getFullYear(),
        visible.getMonth() + delta,
        1
      )
    );
  }

  protected guardarMascota(): void {
    const nombre = this.nombre().trim();
    const especie = this.especie().trim();
    const raza = this.raza().trim();
    const edad = Number(this.edad());
    const peso = Number(this.peso());
    const alergias = this.alergias().trim();

    if (!nombre) {
      this.errorMascota.set('Ingresa el nombre de la mascota.');
      return;
    }

    if (!especie) {
      this.errorMascota.set('Selecciona la especie de la mascota.');
      return;
    }

    if (!raza) {
      this.errorMascota.set('Ingresa la raza de la mascota.');
      return;
    }

    if (!this.edad().trim() || !Number.isFinite(edad) || edad < 0) {
      this.errorMascota.set('Ingresa una edad válida.');
      return;
    }

    if (!this.peso().trim() || !Number.isFinite(peso) || peso <= 0) {
      this.errorMascota.set('Ingresa un peso válido.');
      return;
    }

    const mascota = this.citasService.agregarMascota(
      nombre,
      especie,
      raza,
      edad,
      peso,
      alergias || 'Ninguna'
    );

    this.mascotaId.set(mascota.id);
    this.busquedaMascota.set('');
    this.mostrarFormMascota.set(false);

    this.mensaje.set({
      texto: `${mascota.nombre} se agregó a tus mascotas.`,
      error: false
    });
  }

  protected confirmar(): void {
    const mascota = this.mascotas().find(
      (m) => m.id === this.mascotaId()
    );

    if (!mascota) {
      this.mensaje.set({
        texto: 'Selecciona una mascota.',
        error: true
      });
      return;
    }

    if (!this.motivoConsulta().trim()) {
      this.mensaje.set({
        texto: 'Ingresa el motivo de consulta.',
        error: true
      });
      return;
    }

    if (!this.hora()) {
      this.mensaje.set({
        texto: 'Selecciona un horario disponible.',
        error: true
      });
      return;
    }

    const cita = this.citasService.agregarCita({
      mascotaId: mascota.id,
      mascotaNombre: mascota.nombre,
      servicio: this.servicio(),
      motivoConsulta: this.motivoConsulta().trim(),
      fecha: this.fecha(),
      hora: this.hora(),
      estado: 'Pendiente'
    });

    if (!cita) {
      this.mensaje.set({ texto: 'No se pudo reservar. Revisa la sesión y el horario disponible.', error: true });
      return;
    }

    this.mensaje.set({
      texto: `Cita registrada para ${mascota.nombre} el ${this.fechaLegible(this.fecha())} a las ${this.hora()}.`,
      error: false
    });

    this.hora.set('');
    this.motivoConsulta.set('');
  }

  protected cancelar(cita: Cita): void {
    if (!window.confirm(`¿Cancelar la cita de ${cita.mascotaNombre}?`)) return;
    const error = this.citasService.cambiarEstado(cita.id, 'Cancelada');
    if (error) {
      this.mensaje.set({ texto: error, error: true });
      return;
    }

    this.mensaje.set({
      texto: `Se canceló la cita de ${cita.mascotaNombre}.`,
      error: false
    });
  }

  protected readonly fechaLegible = fechaLegible;

  protected inicial(nombre: string): string {
    return nombre.charAt(0).toUpperCase();
  }
}
