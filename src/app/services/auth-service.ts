import { Injectable, computed, signal } from '@angular/core';
import { Usuario } from '../models/usuario';
import { borrar, guardar, leer } from '../utils/almacenamiento';

const CLAVE_SESION = 'vetconecta.sesion';

export const CORREO_PERSONAL_DEMO = 'personal@vetconecta.pe';

/** Cuenta ficticia que devuelve el boton de Google mientras no hay OAuth real. */
const CUENTA_GOOGLE: Usuario = {
  nombre: 'Julián Campos',
  correo: 'julian.campos@gmail.com',
  proveedor: 'google',
  rol: 'propietario',
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

function restaurarSesion(): Usuario | null {
  const usuario = leer<Usuario | null>(CLAVE_SESION, null);
  if (!usuario || typeof usuario.correo !== 'string' || typeof usuario.nombre !== 'string') {
    return null;
  }

  return {
    ...usuario,
    correo: usuario.correo.trim().toLowerCase(),
    // Las sesiones anteriores a los roles conservan el acceso de propietario.
    rol: usuario.rol === 'personal' ? 'personal' : 'propietario',
  };
}

/**
 * Sesion de demostracion. NO valida credenciales contra ningun servidor:
 * cualquier correo con formato valido y cualquier clave son aceptados.
 * Aqui iria la llamada al backend / Firebase Auth cuando exista.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _usuario = signal<Usuario | null>(restaurarSesion());

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);
  readonly esPersonal = computed(() => this._usuario()?.rol === 'personal');
  readonly inicio = computed(() => this.esPersonal() ? '/gestion-citas' : '/dashboard');
  readonly nombreRol = computed(() => this.esPersonal() ? 'Personal veterinario' : 'Propietario');

  ingresar(correo: string): Usuario {
    const limpio = correo.trim().toLowerCase();
    return this.abrirSesion({
      nombre: limpio === CORREO_PERSONAL_DEMO ? 'Personal veterinario' : nombreDesdeCorreo(limpio) || 'Usuario',
      correo: limpio,
      proveedor: 'correo',
      rol: limpio === CORREO_PERSONAL_DEMO ? 'personal' : 'propietario',
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
