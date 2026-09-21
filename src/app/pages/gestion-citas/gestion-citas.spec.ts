import { TestBed } from '@angular/core/testing';
import { GestionCitas } from './gestion-citas';
import { AuthService, CORREO_PERSONAL_DEMO } from '../../services/auth-service';
import { CitasService } from '../../services/citas-service';
import { aClave, claveHoy } from '../../utils/fecha';

describe('GestionCitas HU-07', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [GestionCitas] });
    const auth = TestBed.inject(AuthService);
    auth.ingresar('ana.torres@correo.com');
    const service = TestBed.inject(CitasService);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const datos = {
      mascotaId: 'colita', mascotaNombre: 'Colita', servicio: 'Consulta general',
      motivoConsulta: 'Control', hora: '09:00', estado: 'Pendiente' as const,
    };
    service.agregarCita({ ...datos, fecha: claveHoy() });
    service.agregarCita({ ...datos, mascotaNombre: 'Luna', fecha: aClave(tomorrow) });
    auth.ingresar(CORREO_PERSONAL_DEMO);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('lists all required appointment fields for today', async () => {
    const fixture = TestBed.createComponent(GestionCitas);
    await fixture.whenStable();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Colita');
    expect(rows[0].textContent).toContain('Ana Torres');
    expect(rows[0].textContent).toContain('09:00');
    expect(rows[0].textContent).toContain('Consulta general');
    expect(rows[0].querySelector('select').value).toBe('Pendiente');
  });

  it('filters by date, shows an empty result and allows all dates', async () => {
    const fixture = TestBed.createComponent(GestionCitas);
    await fixture.whenStable();
    const date = fixture.nativeElement.querySelector('input[type="date"]') as HTMLInputElement;
    date.value = '2000-01-01';
    date.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('tbody')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No hay citas para esta fecha');
    date.value = '';
    date.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('updates a state from the table and shows a confirmation', async () => {
    const fixture = TestBed.createComponent(GestionCitas);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'Atendida';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(TestBed.inject(CitasService).citas()[0].estado).toBe('Atendida');
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Atendida');
  });

  it('shows the persisted state when opening a table with cancelled appointments', async () => {
    const service = TestBed.inject(CitasService);
    service.cambiarEstado(service.citas()[0].id, 'Cancelada');
    const fixture = TestBed.createComponent(GestionCitas);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('select').value).toBe('Cancelada');
  });

  it('restores the selected state when cancellation is declined', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fixture = TestBed.createComponent(GestionCitas);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'Cancelada';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(select.value).toBe('Pendiente');
    expect(TestBed.inject(CitasService).citas()[0].estado).toBe('Pendiente');
  });
});
