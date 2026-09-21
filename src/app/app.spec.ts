import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthService, CORREO_PERSONAL_DEMO } from './services/auth-service';

describe('App navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('hides navigation without a session', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('shows owner links without staff management', async () => {
    TestBed.inject(AuthService).ingresar('ana@correo.com');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('a[href="/agendar"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[href="/gestion-citas"]')).toBeNull();
  });

  it('shows staff management in desktop and mobile navigation', async () => {
    TestBed.inject(AuthService).ingresar(CORREO_PERSONAL_DEMO);
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('a[href="/gestion-citas"]').length).toBe(2);
    expect(fixture.nativeElement.querySelector('a[href="/agendar"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('a[href="/recordatorios"]')).toBeNull();
  });
});
