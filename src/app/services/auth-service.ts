import { Injectable, computed, signal } from '@angular/core';
import { Usuario } from '../models/usuario';
import { borrar, guardar, leer } from '../utils/almacenamiento';

const CLAVE_SESION = 'vetconecta.sesion';

/** Cuenta ficticia que devuelve el boton de Google mientras no hay OAuth real. */
const CUENTA_GOOGLE: Usuario = {
  nombre: 'Julián Campos',
  correo: 'julian.campos@gmail.com',
  proveedor: 'google',
};

/** Convierte "ana.torres@correo.com" en "Ana Torres". */
function nombreDesdeCorreo(correo: string): string {
  return correo
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ');
}

/**
 * Sesion de demostracion. NO valida credenciales contra ningun servidor:
 * cualquier correo con formato valido y cualquier clave son aceptados.
 * Aqui iria la llamada al backend / Firebase Auth cuando exista.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _usuario = signal<Usuario | null>(leer<Usuario | null>(CLAVE_SESION, null));

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);

  ingresar(correo: string): Usuario {
    const limpio = correo.trim().toLowerCase();
    return this.abrirSesion({
      nombre: nombreDesdeCorreo(limpio) || 'Usuario',
      correo: limpio,
      proveedor: 'correo',
    });
  }

  ingresarConGoogle(): Usuario {
    return this.abrirSesion(CUENTA_GOOGLE);
  }

  salir(): void {
    this._usuario.set(null);
    borrar(CLAVE_SESION);
  }

  private abrirSesion(usuario: Usuario): Usuario {
    this._usuario.set(usuario);
    guardar(CLAVE_SESION, usuario);
    return usuario;
  }
}
