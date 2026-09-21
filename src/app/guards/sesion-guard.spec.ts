import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { AuthService, CORREO_PERSONAL_DEMO } from '../services/auth-service';

describe('Role routes', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  afterEach(() => localStorage.clear());

  it('redirects anonymous staff-route requests to login', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/gestion-citas');
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('blocks an owner opening the staff URL directly', async () => {
    TestBed.inject(AuthService).ingresar('ana@correo.com');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/gestion-citas');
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  it('allows the staff route and redirects owner-only routes to it', async () => {
    TestBed.inject(AuthService).ingresar(CORREO_PERSONAL_DEMO);
    const harness = await RouterTestingHarness.create();
    for (const path of ['/gestion-citas', '/agendar', '/recordatorios', '/login', '/']) {
      await harness.navigateByUrl(path);
      expect(TestBed.inject(Router).url).toBe('/gestion-citas');
    }
  });
});
