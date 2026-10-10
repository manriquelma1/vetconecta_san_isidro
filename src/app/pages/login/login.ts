import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, CORREO_PERSONAL_DEMO } from '../../services/auth-service';

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  imports: [],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly modoRegistro = signal(false);
  protected readonly nombre = signal('');
  protected readonly correo = signal('');
  protected readonly clave = signal('');
  protected readonly confirmarClave = signal('');
  protected readonly verClave = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal('');
  protected readonly cargando = signal(false);
  protected readonly correoPersonal = CORREO_PERSONAL_DEMO;

  protected async ingresar(): Promise<void> {
    const correo = this.correo().trim();
    const clave = this.clave();

    if (!FORMATO_CORREO.test(correo) || !clave) {
      this.error.set('Correo o contraseña incorrectos.');
      return;
    }

    this.cargando.set(true);

    try {
      await this.auth.ingresar(correo, clave);
      this.router.navigate([this.auth.inicio()]);
    } catch {
      // El backend nunca dice cual dato fallo (HU-09): mismo mensaje siempre.
      this.error.set('Correo o contraseña incorrectos.');
    } finally {
      this.cargando.set(false);
    }
  }

  protected async registrar(): Promise<void> {
    const nombre = this.nombre().trim();
    const correo = this.correo().trim();
    const clave = this.clave();
    const confirmarClave = this.confirmarClave();

    if (!nombre) {
      this.error.set('Ingresa tu nombre.');
      return;
    }

    if (!FORMATO_CORREO.test(correo)) {
      this.error.set('Ingresa un correo válido.');
      return;
    }

    if (clave.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (clave !== confirmarClave) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.cargando.set(true);

    try {
      await this.auth.registrar(nombre, correo, clave);
      this.router.navigate([this.auth.inicio()]);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo crear la cuenta.');
    } finally {
      this.cargando.set(false);
    }
  }

  protected async ingresarConGoogle(): Promise<void> {
    this.cargando.set(true);

    try {
      await this.auth.ingresarConGoogle();
      this.router.navigate([this.auth.inicio()]);
    } catch {
      this.error.set('No se pudo iniciar sesión con Google en este entorno.');
    } finally {
      this.cargando.set(false);
    }
  }

  protected cambiarModo(): void {
    this.modoRegistro.set(!this.modoRegistro());
    this.nombre.set('');
    this.correo.set('');
    this.clave.set('');
    this.confirmarClave.set('');
    this.error.set('');
    this.exito.set('');
    this.verClave.set(false);
  }

  protected escribirNombre(evento: Event): void {
    this.nombre.set((evento.target as HTMLInputElement).value);
    this.error.set('');
  }

  protected escribirCorreo(evento: Event): void {
    this.correo.set((evento.target as HTMLInputElement).value);
    this.error.set('');
  }

  protected escribirClave(evento: Event): void {
    this.clave.set((evento.target as HTMLInputElement).value);
    this.error.set('');
  }

  protected escribirConfirmarClave(evento: Event): void {
    this.confirmarClave.set((evento.target as HTMLInputElement).value);
    this.error.set('');
  }
}
