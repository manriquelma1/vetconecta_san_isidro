import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CitasService } from '../../services/citas-service';
import { Mascota } from '../../models/mascota';

@Component({
  imports: [RouterLink],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly citasService = inject(CitasService);

  protected readonly usuario = this.auth.usuario;
  protected readonly esPersonal = this.auth.esPersonal;
  protected readonly nombreRol = this.auth.nombreRol;
  protected readonly mascotas = this.citasService.mascotas;

  protected readonly mascotaSeleccionadaId = signal(
    this.citasService.mascotas()[0]?.id ?? ''
  );

  protected readonly nombre = signal('');
  protected readonly especie = signal('');
  protected readonly raza = signal('');
  protected readonly edad = signal('');
  protected readonly peso = signal('');
  protected readonly alergias = signal('');
  protected readonly editando = signal(false);
  protected readonly nuevaMascota = signal(false);

  protected readonly mensaje = signal<{
    texto: string;
    error: boolean;
  } | null>(null);

  constructor() {
    const primeraMascota = this.citasService.mascotas()[0];

    if (primeraMascota) {
      this.cargarMascota(primeraMascota);
    }
  }

  protected seleccionarMascota(id: string): void {
    const mascota = this.citasService.obtenerMascota(id);

    if (!mascota) {
      return;
    }

    this.mascotaSeleccionadaId.set(id);
    this.cargarMascota(mascota);
    this.editando.set(false);
    this.nuevaMascota.set(false);
    this.mensaje.set(null);
  }

  protected comenzarEdicion(): void {
    this.editando.set(true);
    this.nuevaMascota.set(false);
    this.mensaje.set(null);
  }

  protected comenzarNuevaMascota(): void {
    this.mascotaSeleccionadaId.set('');
    this.nombre.set('');
    this.especie.set('');
    this.raza.set('');
    this.edad.set('');
    this.peso.set('');
    this.alergias.set('');
    this.editando.set(true);
    this.nuevaMascota.set(true);
    this.mensaje.set(null);
  }

  protected cancelarEdicion(): void {
    if (this.nuevaMascota()) {
      const primeraMascota = this.mascotas()[0];

      if (primeraMascota) {
        this.mascotaSeleccionadaId.set(primeraMascota.id);
        this.cargarMascota(primeraMascota);
      }

      this.nuevaMascota.set(false);
    } else {
      const mascota = this.citasService.obtenerMascota(
        this.mascotaSeleccionadaId()
      );

      if (mascota) {
        this.cargarMascota(mascota);
      }
    }

    this.editando.set(false);
    this.mensaje.set(null);
  }

  protected guardarFicha(): void {
    const nombre = this.nombre().trim();
    const especie = this.especie().trim();
    const raza = this.raza().trim();
    const edad = Number(this.edad());
    const peso = Number(this.peso());
    const alergias = this.alergias().trim();

    if (!nombre) {
      this.mensaje.set({
        texto: 'Ingresa el nombre de la mascota.',
        error: true
      });
      return;
    }

    if (!especie) {
      this.mensaje.set({
        texto: 'Selecciona la especie de la mascota.',
        error: true
      });
      return;
    }

    if (!raza) {
      this.mensaje.set({
        texto: 'Ingresa la raza de la mascota.',
        error: true
      });
      return;
    }

    if (
      !this.edad().trim() ||
      !Number.isFinite(edad) ||
      edad < 0
    ) {
      this.mensaje.set({
        texto: 'Ingresa una edad válida.',
        error: true
      });
      return;
    }

    if (
      !this.peso().trim() ||
      !Number.isFinite(peso) ||
      peso <= 0
    ) {
      this.mensaje.set({
        texto: 'Ingresa un peso válido.',
        error: true
      });
      return;
    }

    if (this.nuevaMascota()) {
      const mascota = this.citasService.agregarMascota(
        nombre,
        especie,
        raza,
        edad,
        peso,
        alergias || 'Ninguna'
      );

      this.mascotaSeleccionadaId.set(mascota.id);
      this.cargarMascota(mascota);
      this.nuevaMascota.set(false);

      this.mensaje.set({
        texto: 'Mascota registrada correctamente.',
        error: false
      });
    } else {
      const id = this.mascotaSeleccionadaId();

      this.citasService.actualizarMascota(id, {
        nombre,
        especie,
        raza,
        edad,
        peso,
        alergias: alergias || 'Ninguna'
      });

      const mascotaActualizada =
        this.citasService.obtenerMascota(id);

      if (mascotaActualizada) {
        this.cargarMascota(mascotaActualizada);
      }

      this.mensaje.set({
        texto: 'Ficha actualizada correctamente.',
        error: false
      });
    }

    this.editando.set(false);
  }

  protected cambiarNombre(evento: Event): void {
    this.nombre.set(
      (evento.target as HTMLInputElement).value
    );
  }

  protected cambiarEspecie(evento: Event): void {
    this.especie.set(
      (evento.target as HTMLSelectElement).value
    );
  }

  protected cambiarRaza(evento: Event): void {
    this.raza.set(
      (evento.target as HTMLInputElement).value
    );
  }

  protected cambiarEdad(evento: Event): void {
    this.edad.set(
      (evento.target as HTMLInputElement).value
    );
  }

  protected cambiarPeso(evento: Event): void {
    this.peso.set(
      (evento.target as HTMLInputElement).value
    );
  }

  protected cambiarAlergias(evento: Event): void {
    this.alergias.set(
      (evento.target as HTMLTextAreaElement).value
    );
  }

  protected inicial(nombre: string): string {
    return nombre.trim().charAt(0).toUpperCase();
  }

  protected cerrarSesion(): void {
    this.auth.salir();
    this.router.navigate(['/login']);
  }

  private cargarMascota(mascota: Mascota): void {
    this.nombre.set(mascota.nombre);
    this.especie.set(mascota.especie ?? '');
    this.raza.set(mascota.raza ?? '');
    this.edad.set(String(mascota.edad ?? 0));
    this.peso.set(String(mascota.peso ?? 0));
    this.alergias.set(mascota.alergias ?? '');
  }
}
