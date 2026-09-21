import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroAtencion } from './registro-atencion';

describe('RegistroAtencion', () => {
  let component: RegistroAtencion;
  let fixture: ComponentFixture<RegistroAtencion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroAtencion],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroAtencion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
