import { TestBed } from '@angular/core/testing';
import { AuthService, CORREO_PERSONAL_DEMO } from './auth-service';
import { CitasService } from './citas-service';
import { EstadoCita } from '../models/cita';
import { claveHoy } from '../utils/fecha';

describe('Appointment ownership and states', () => {
  let auth: AuthService;
  let service: CitasService;
  const reserva = () => ({
    mascotaId: 'colita', mascotaNombre: 'Colita', servicio: 'Consulta general',
    motivoConsulta: 'Control', fecha: claveHoy(), hora: '09:00', estado: 'Pendiente' as const,
  });

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthService);
    auth.ingresar('ana.torres@correo.com');
    service = TestBed.inject(CitasService);
  });

  afterEach(() => localStorage.clear());

  it('associates new bookings with their owner and separates accounts', () => {
    const first = service.agregarCita(reserva())!;
    expect(first).toMatchObject({ propietarioCorreo: 'ana.torres@correo.com', propietarioNombre: 'Ana Torres' });
    auth.ingresar('luis@correo.com');
    expect(service.citasOrdenadas()).toEqual([]);
    service.agregarCita({ ...reserva(), hora: '10:00' });
    expect(service.citas().length).toBe(1);
    auth.ingresar(CORREO_PERSONAL_DEMO);
    expect(service.citasOrdenadas().map((cita) => cita.hora)).toEqual(['09:00', '10:00']);
    auth.salir();
    expect(service.citas()).toEqual([]);
  });

  it('prevents an owner changing another booking or marking their own as attended', () => {
    const cita = service.agregarCita(reserva())!;
    expect(service.cambiarEstado(cita.id, 'Atendida')).not.toBeNull();
    auth.ingresar('luis@correo.com');
    expect(service.cambiarEstado(cita.id, 'Cancelada')).not.toBeNull();
    auth.ingresar(CORREO_PERSONAL_DEMO);
    expect(service.citas()[0].estado).toBe('Pendiente');
  });

  it('cancels an owner booking without deleting it and releases the time slot', () => {
    const cita = service.agregarCita(reserva())!;
    expect(service.cambiarEstado(cita.id, 'Cancelada')).toBeNull();
    expect(service.citas()).toHaveLength(1);
    expect(service.citas()[0].estado).toBe('Cancelada');
    expect(service.horasOcupadas(cita.fecha)).toEqual([]);
    expect(service.citasProximas()).toEqual([]);
    expect(JSON.parse(localStorage.getItem('vetconecta.citas')!)[0].estado).toBe('Cancelada');
  });

  it('allows all three states for staff and persists them', () => {
    const cita = service.agregarCita(reserva())!;
    auth.ingresar(CORREO_PERSONAL_DEMO);
    for (const estado of ['Atendida', 'Cancelada', 'Pendiente'] as EstadoCita[]) {
      expect(service.cambiarEstado(cita.id, estado)).toBeNull();
      expect(service.citas()[0].estado).toBe(estado);
      expect(JSON.parse(localStorage.getItem('vetconecta.citas')!)[0].estado).toBe(estado);
    }
  });

  it('rejects duplicate reservations and reactivation into an occupied slot', () => {
    const cita = service.agregarCita(reserva())!;
    auth.ingresar('luis@correo.com');
    expect(service.agregarCita(reserva())).toBeNull();
    auth.ingresar(CORREO_PERSONAL_DEMO);
    service.cambiarEstado(cita.id, 'Cancelada');
    auth.ingresar('luis@correo.com');
    expect(service.agregarCita(reserva())).not.toBeNull();
    auth.ingresar(CORREO_PERSONAL_DEMO);
    expect(service.cambiarEstado(cita.id, 'Pendiente')).toContain('ocupado');
    expect(service.citas().find((item) => item.id === cita.id)?.estado).toBe('Cancelada');
  });

  it('rejects unknown states and missing appointments without modifying storage', () => {
    const cita = service.agregarCita(reserva())!;
    auth.ingresar(CORREO_PERSONAL_DEMO);
    expect(service.cambiarEstado(cita.id, 'Inexistente' as EstadoCita)).not.toBeNull();
    expect(service.cambiarEstado('inexistente', 'Cancelada')).not.toBeNull();
    expect(service.citas()[0].estado).toBe('Pendiente');
  });

  it('preserves legacy bookings without exposing them to an arbitrary owner', () => {
    localStorage.setItem('vetconecta.citas', JSON.stringify([{ ...reserva(), id: 'legacy', creadaEn: '' }]));
    const restored = TestBed.runInInjectionContext(() => new CitasService());
    expect(restored.citas()).toEqual([]);
    auth.ingresar(CORREO_PERSONAL_DEMO);
    expect(restored.citas()[0].id).toBe('legacy');
    expect(restored.citas()[0].propietarioCorreo).toBeUndefined();
  });
});
