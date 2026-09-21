import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, CORREO_PERSONAL_DEMO } from '../../services/auth-service';

/** Validacion minima de formato, no de existencia del usuario. */
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

  protected readonly correo = signal('');
  protected readonly clave = signal('');
  protected readonly verClave = signal(false);
  protected readonly error = signal('');
  protected readonly correoPersonal = CORREO_PERSONAL_DEMO;

  protected ingresar(): void {
    const correo = this.correo().trim();

    if (!FORMATO_CORREO.test(correo)) {
      this.error.set('Escribe un correo válido, por ejemplo ana@correo.com');
      return;
    }
    if (!this.clave()) {
      this.error.set('Escribe una clave para continuar.');
      return;
    }

    // Cualquier clave es aceptada: todavia no hay validacion de usuarios.
    this.auth.ingresar(correo);
    this.router.navigate([this.auth.inicio()]);
  }

  protected ingresarConGoogle(): void {
    this.auth.ingresarConGoogle();
    this.router.navigate([this.auth.inicio()]);
  }

  protected escribirCorreo(evento: Event): void {
    this.correo.set((evento.target as HTMLInputElement).value);
    this.error.set('');
  }

  protected escribirClave(evento: Event): void {
    this.clave.set((evento.target as HTMLInputElement).value);
    this.error.set('');
  }
}
