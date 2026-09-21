import { Component, inject } from '@angular/core';
import { RouterLinkActive, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth-service';

@Component({
  imports: [RouterOutlet, RouterLinkWithHref,RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly auth = inject(AuthService);

  /** La barra de navegacion solo se muestra con sesion iniciada. */
  protected readonly autenticado = this.auth.autenticado;
  protected readonly usuario = this.auth.usuario;
  protected readonly esPersonal = this.auth.esPersonal;
  protected readonly nombreRol = this.auth.nombreRol;
}
