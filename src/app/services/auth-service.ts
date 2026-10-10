import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { RespuestaAuth, Usuario } from '../models/usuario';
import { borrar, guardar, leer } from '../utils/almacenamiento';
import { extraerMensajeError } from '../utils/http-error';
import { environment } from '../../environments/environment';

const CLAVE_TOKEN = 'vetconecta.token';
const CLAVE_USUARIO = 'vetconecta.usuario';

/**
 * Cuenta de demostracion que ya existe en el backend (sembrada por EF Core).
 * "Ingresar con Google" ya no puede fabricar una sesion local: sin un JWT real
 * del backend, cualquier llamada a la API fallaria. En su lugar, es un atajo
 * que inicia sesion de verdad con esta cuenta.
 */
const CORREO_GOOGLE_DEMO = 'julian.campos@gmail.com';
const CLAVE_GOOGLE_DEMO = 'Cliente123';

export const CORREO_PERSONAL_DEMO = 'personal@vetconecta.pe';

function restaurarUsuario(): Usuario | null {
  const token = leer<string | null>(CLAVE_TOKEN, null);
  const usuario = leer<Usuario | null>(CLAVE_USUARIO, null);

  if (!token || !usuario || typeof usuario.correo !== 'string') {
    return null;
  }

  return usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _usuario = signal<Usuario | null>(restaurarUsuario());

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);
  readonly esPersonal = computed(() => this._usuario()?.rol === 'personal');
  readonly inicio = computed(() => (this.esPersonal() ? '/gestion-citas' : '/dashboard'));
  readonly nombreRol = computed(() => (this.esPersonal() ? 'Personal veterinario' : 'Propietario'));

  /** Lanza un Error con el mensaje del backend si las credenciales no son validas. */
  async ingresar(correo: string, clave: string): Promise<void> {
    await this.autenticar('login', { correo: correo.trim(), clave });
  }

  /** Lanza un Error con el mensaje del backend (ej. correo ya registrado). */
  async registrar(nombre: string, correo: string, clave: string): Promise<void> {
    await this.autenticar('registro', { nombre: nombre.trim(), correo: correo.trim(), clave });
  }

  async ingresarConGoogle(): Promise<void> {
    await this.ingresar(CORREO_GOOGLE_DEMO, CLAVE_GOOGLE_DEMO);
  }

  salir(): void {
    this._usuario.set(null);
    borrar(CLAVE_TOKEN);
    borrar(CLAVE_USUARIO);
  }

  private async autenticar(ruta: 'login' | 'registro', datos: unknown): Promise<void> {
    try {
      const respuesta = await firstValueFrom(
        this.http.post<RespuestaAuth>(`${environment.apiUrl}/auth/${ruta}`, datos)
      );

      const usuario: Usuario = { nombre: respuesta.nombre, correo: respuesta.correo, rol: respuesta.rol };

      this._usuario.set(usuario);
      guardar(CLAVE_TOKEN, respuesta.token);
      guardar(CLAVE_USUARIO, usuario);
    } catch (error) {
      throw new Error(extraerMensajeError(error));
    }
  }
}
