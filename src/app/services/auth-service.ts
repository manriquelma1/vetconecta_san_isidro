import { Injectable, computed, signal } from '@angular/core';
import { Usuario, UsuarioRegistrado } from '../models/usuario';
import { borrar, guardar, leer } from '../utils/almacenamiento';

const CLAVE_SESION = 'vetconecta.sesion';
const CLAVE_USUARIOS = 'vetconecta.usuarios';

export const CORREO_PERSONAL_DEMO = 'personal@vetconecta.pe';

const CUENTA_GOOGLE: Usuario = {
  nombre: 'Julián Campos',
  correo: 'julian.campos@gmail.com',
  proveedor: 'google',
  rol: 'propietario',
};

const PERSONAL_DEMO: UsuarioRegistrado = {
  nombre: 'Personal veterinario',
  correo: CORREO_PERSONAL_DEMO,
  clave: 'Vet12345',
  proveedor: 'correo',
  rol: 'personal',
};

function restaurarSesion(): Usuario | null {
  const usuario = leer<Usuario | null>(CLAVE_SESION, null);

  if (
    !usuario ||
    typeof usuario.correo !== 'string' ||
    typeof usuario.nombre !== 'string'
  ) {
    return null;
  }

  return {
    ...usuario,
    correo: usuario.correo.trim().toLowerCase(),
    rol: usuario.rol === 'personal' ? 'personal' : 'propietario',
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _usuario = signal<Usuario | null>(restaurarSesion());

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);
  readonly esPersonal = computed(() => this._usuario()?.rol === 'personal');
  readonly inicio = computed(() =>
    this.esPersonal() ? '/gestion-citas' : '/dashboard'
  );
  readonly nombreRol = computed(() =>
    this.esPersonal() ? 'Personal veterinario' : 'Propietario'
  );

  constructor() {
    this.inicializarPersonal();
  }

  registrar(
    nombre: string,
    correo: string,
    clave: string
  ): Usuario | null {
    const nombreLimpio = nombre.trim();
    const correoLimpio = correo.trim().toLowerCase();

    const usuarios = this.obtenerUsuarios();

    const existe = usuarios.some(
      (usuario) => usuario.correo === correoLimpio
    );

    if (existe) {
      return null;
    }

    const nuevoUsuario: UsuarioRegistrado = {
      nombre: nombreLimpio,
      correo: correoLimpio,
      clave,
      proveedor: 'correo',
      rol: 'propietario',
    };

    usuarios.push(nuevoUsuario);
    guardar(CLAVE_USUARIOS, usuarios);

    return this.abrirSesion(this.sinClave(nuevoUsuario));
  }

  ingresar(correo: string, clave: string): Usuario | null {
    const correoLimpio = correo.trim().toLowerCase();

    const usuario = this.obtenerUsuarios().find(
      (item) =>
        item.correo === correoLimpio &&
        item.clave === clave
    );

    if (!usuario) {
      return null;
    }

    return this.abrirSesion(this.sinClave(usuario));
  }

  ingresarConGoogle(): Usuario {
    return this.abrirSesion(CUENTA_GOOGLE);
  }

  correoExiste(correo: string): boolean {
    const correoLimpio = correo.trim().toLowerCase();

    return this.obtenerUsuarios().some(
      (usuario) => usuario.correo === correoLimpio
    );
  }

  salir(): void {
    this._usuario.set(null);
    borrar(CLAVE_SESION);
  }

  private obtenerUsuarios(): UsuarioRegistrado[] {
    return leer<UsuarioRegistrado[]>(CLAVE_USUARIOS, []);
  }

  private inicializarPersonal(): void {
    const usuarios = this.obtenerUsuarios();

    const existe = usuarios.some(
      (usuario) => usuario.correo === CORREO_PERSONAL_DEMO
    );

    if (!existe) {
      usuarios.push(PERSONAL_DEMO);
      guardar(CLAVE_USUARIOS, usuarios);
    }
  }

  private sinClave(usuario: UsuarioRegistrado): Usuario {
    return {
      nombre: usuario.nombre,
      correo: usuario.correo,
      proveedor: usuario.proveedor,
      rol: usuario.rol,
    };
  }

  private abrirSesion(usuario: Usuario): Usuario {
    this._usuario.set(usuario);
    guardar(CLAVE_SESION, usuario);
    return usuario;
  }
}