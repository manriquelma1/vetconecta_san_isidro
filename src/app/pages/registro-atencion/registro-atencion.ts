
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HistorialService } from '../../services/historial-service';
import { CitasService } from '../../services/citas-service';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-registro-atencion',
  styleUrl: './registro-atencion.css',
  templateUrl: './registro-atencion.html',
})
export class RegistroAtencion {
  private readonly fb = inject(FormBuilder);
  private readonly historialService = inject(HistorialService);
  private readonly citasService = inject(CitasService);

  readonly mascotas = this.citasService.mascotas;
  guardado = false;

  form = this.fb.group({
    mascotaId: ['', Validators.required],
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    motivo: ['', Validators.required],
    diagnostico: ['', [Validators.required, Validators.minLength(5)]],
    tratamiento: ['', [Validators.required, Validators.minLength(5)]],
    descripcion: [''],
    veterinario: ['', Validators.required],
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.historialService.agregarVisita(this.form.getRawValue() as any);
    this.guardado = true;
    this.form.reset();
  }
}

