import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Cita } from '../../models/cita';
import { AuthService } from '../../services/auth-service';
import { CitasService } from '../../services/citas-service';
import { NOMBRES_MES, aClave, fechaLegible } from '../../utils/fecha';
import { SERVICIOS } from '../../utils/servicios';

const HORARIOS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];

const ESPECIES = ['Canino', 'Felino', 'Otro'];

const SEXOS = ['Hembra', 'Macho'];

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
  private readonly auth = inject(AuthService);

  protected readonly servicios = SERVICIOS;
  protected readonly especies = ESPECIES;
  protected readonly sexos = SEXOS;
  protected readonly mascotas = this.citasService.mascotas;
  protected readonly citas = this.citasService.citasProximas;

  private readonly hoy = aClave(new Date());

  protected readonly mascotaId = signal(this.citasService.mascotas()[0]?.id ?? '');
  protected readonly servicio = signal(SERVICIOS[0]);
  protected readonly fecha = signal(this.hoy);
  protected readonly hora = signal('');
  protected readonly mesVisible = signal(new Date());
  protected readonly busquedaMascota = signal('');

  // --- Ficha de la mascota nueva ---
  protected readonly mostrarFormMascota = signal(false);
  protected readonly mNombre = signal('');
  protected readonly mEspecie = signal(ESPECIES[0]);
  protected readonly mRaza = signal('');
  protected readonly mEdad = signal('');
  protected readonly mSexo = signal(SEXOS[0]);
  protected readonly mPropietario = signal('');
  protected readonly errorMascota = signal('');
  protected readonly mensaje = signal<{ texto: string; error: boolean } | null>(null);

  private readonly dialogoMascota = viewChild<ElementRef<HTMLDialogElement>>('dialogoMascota');

  constructor() {
    // Abre y cierra el <dialog> nativo siguiendo a la senal.
    effect(() => {
      const dialogo = this.dialogoMascota()?.nativeElement;
      if (!dialogo) return;
      if (this.mostrarFormMascota()) {
        if (!dialogo.open) dialogo.showModal();
      } else if (dialogo.open) {
        dialogo.close();
      }
    });
  }

  /** Mascotas que coinciden con el buscador (por nombre, raza o propietario). */
  protected readonly mascotasFiltradas = computed(() => {
    const texto = this.busquedaMascota().trim().toLowerCase();
    const mascotas = this.mascotas();
    if (!texto) return mascotas;
    return mascotas.filter((mascota) =>
      [mascota.nombre, mascota.raza, mascota.propietario]
        .some((campo) => (campo ?? '').toLowerCase().includes(texto)),
    );
  });

  /** La seleccionada puede quedar fuera del filtro: hay que avisarlo. */
  protected readonly seleccionadaOculta = computed(() => {
    const id = this.mascotaId();
    return !!id && !this.mascotasFiltradas().some((mascota) => mascota.id === id);
  });

  protected readonly mascotaSeleccionada = computed(
    () => this.mascotas().find((mascota) => mascota.id === this.mascotaId()) ?? null,
  );

  protected readonly tituloMes = computed(() => {
    const mes = this.mesVisible();
    return `${NOMBRES_MES[mes.getMonth()]} ${mes.getFullYear()}`;
  });

  /** Celdas del calendario: relleno del mes anterior + dias del mes visible. */
  protected readonly dias = computed<Celda[]>(() => {
    const visible = this.mesVisible();
    const anio = visible.getFullYear();
    const mes = visible.getMonth();
    const desfase = (new Date(anio, mes, 1).getDay() + 6) % 7; // semana que empieza en lunes
    const ultimoDiaMesAnterior = new Date(anio, mes, 0).getDate();
    const totalDias = new Date(anio, mes + 1, 0).getDate();

    const celdas: Celda[] = [];
    for (let i = desfase; i > 0; i--) {
      celdas.push({ numero: ultimoDiaMesAnterior - i + 1, clave: '', fueraDeMes: true, pasado: true });
    }
    for (let dia = 1; dia <= totalDias; dia++) {
      const clave = aClave(new Date(anio, mes, dia));
      celdas.push({ numero: dia, clave, fueraDeMes: false, pasado: clave < this.hoy });
    }
    return celdas;
  });

  /** Horarios del dia seleccionado, marcando los que ya tienen una cita guardada. */
  protected readonly horarios = computed(() => {
    const ocupadas = this.citasService.horasOcupadas(this.fecha());
    return HORARIOS.map((hora) => ({ hora, ocupado: ocupadas.includes(hora) }));
  });

  protected escribirBusquedaMascota(evento: Event): void {
    this.busquedaMascota.set((evento.target as HTMLInputElement).value);
  }

  protected seleccionarMascota(id: string): void {
    this.mascotaId.set(id);
    this.mensaje.set(null);
  }

  protected seleccionarServicio(evento: Event): void {
    this.servicio.set((evento.target as HTMLSelectElement).value);
  }

  protected seleccionarDia(celda: Celda): void {
    if (celda.fueraDeMes || celda.pasado) return;
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
    this.mesVisible.set(new Date(visible.getFullYear(), visible.getMonth() + delta, 1));
  }

  protected abrirFormMascota(): void {
    // Si busco una mascota que no existe, ese texto ya es el nombre que quiere dar de alta.
    this.mNombre.set(this.busquedaMascota().trim());
    this.mEspecie.set(ESPECIES[0]);
    this.mRaza.set('');
    this.mEdad.set('');
    this.mSexo.set(SEXOS[0]);
    // El propietario por defecto es quien tiene la sesion abierta.
    this.mPropietario.set(this.auth.usuario()?.nombre ?? '');
    this.errorMascota.set('');
    this.mostrarFormMascota.set(true);
  }

  /** El <dialog> nativo no cierra al pulsar el fondo: el clic se reporta sobre el propio dialogo. */
  protected cerrarSiFondo(evento: MouseEvent): void {
    if (evento.target === this.dialogoMascota()?.nativeElement) {
      this.mostrarFormMascota.set(false);
    }
  }

  protected guardarMascota(): void {
    const nombre = this.mNombre().trim();
    if (!nombre) {
      this.errorMascota.set('Escribe el nombre de la mascota.');
      return;
    }

    const anios = Number(this.mEdad());
    if (this.mEdad() && (!Number.isFinite(anios) || anios < 0 || anios > 40)) {
      this.errorMascota.set('La edad debe ser un número de años entre 0 y 40.');
      return;
    }

    const mascota = this.citasService.agregarMascota({
      nombre,
      especie: this.mEspecie(),
      raza: this.mRaza().trim() || undefined,
      edad: this.mEdad() ? `${anios} ${anios === 1 ? 'año' : 'años'}` : undefined,
      sexo: this.mSexo(),
      propietario: this.mPropietario().trim() || undefined,
    });

    this.mascotaId.set(mascota.id);
    this.busquedaMascota.set('');
    this.mostrarFormMascota.set(false);
    this.mensaje.set({ texto: `${mascota.nombre} se agregó a tus mascotas.`, error: false });
  }

  protected escribirMascota(
    destino: 'mNombre' | 'mEspecie' | 'mRaza' | 'mEdad' | 'mSexo' | 'mPropietario',
    evento: Event,
  ): void {
    const valor = (evento.target as HTMLInputElement | HTMLSelectElement).value;
    this[destino].set(valor);
    this.errorMascota.set('');
  }

  protected confirmar(): void {
    const mascota = this.mascotas().find((m) => m.id === this.mascotaId());
    if (!mascota) {
      this.mensaje.set({ texto: 'Selecciona una mascota.', error: true });
      return;
    }
    if (!this.hora()) {
      this.mensaje.set({ texto: 'Selecciona un horario disponible.', error: true });
      return;
    }

    this.citasService.agregarCita({
      mascotaId: mascota.id,
      mascotaNombre: mascota.nombre,
      servicio: this.servicio(),
      fecha: this.fecha(),
      hora: this.hora(),
    });

    this.mensaje.set({
      texto: `Cita registrada para ${mascota.nombre} el ${this.fechaLegible(this.fecha())} a las ${this.hora()}.`,
      error: false,
    });
    this.hora.set('');
  }

  protected cancelar(cita: Cita): void {
    this.citasService.eliminarCita(cita.id);
    this.mensaje.set({ texto: `Se cancelo la cita de ${cita.mascotaNombre}.`, error: false });
  }

  protected readonly fechaLegible = fechaLegible;

  protected inicial(nombre: string): string {
    return nombre.charAt(0).toUpperCase();
  }
}
