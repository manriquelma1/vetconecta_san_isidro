import { AuthService, CORREO_PERSONAL_DEMO } from './auth-service';

describe('AuthService roles', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('assigns the owner role and normalizes the email', () => {
    const auth = new AuthService();
    expect(auth.ingresar(' ANA.TORRES@correo.com ')).toMatchObject({
      rol: 'propietario', nombre: 'Ana Torres', correo: 'ana.torres@correo.com',
    });
    expect(auth.inicio()).toBe('/dashboard');
  });

  it('persists the staff account role and restores its home page', () => {
    new AuthService().ingresar(CORREO_PERSONAL_DEMO.toUpperCase());
    const restored = new AuthService();
    expect(restored.esPersonal()).toBe(true);
    expect(restored.inicio()).toBe('/gestion-citas');
  });

  it('restores legacy sessions as owners without assigning staff privileges', () => {
    localStorage.setItem('vetconecta.sesion', JSON.stringify({
      correo: 'ana@correo.com', nombre: 'Ana', proveedor: 'correo',
    }));
    expect(new AuthService().usuario()?.rol).toBe('propietario');
  });

  it('clears the role on logout and uses the owner role for Google', () => {
    const auth = new AuthService();
    auth.ingresar(CORREO_PERSONAL_DEMO);
    auth.salir();
    expect(auth.autenticado()).toBe(false);
    expect(new AuthService().usuario()).toBeNull();
    expect(auth.ingresarConGoogle().rol).toBe('propietario');
  });

  it('ignores malformed session data', () => {
    localStorage.setItem('vetconecta.sesion', '{"rol":"personal"}');
    expect(new AuthService().autenticado()).toBe(false);
  });
});
