import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; 
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';

import {
  Gender,
  SolicitudesService,
} from '../../../core/services/solicitudes.service';

@Component({
  selector: 'app-student-postulation-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './postulation.page.html',
  styleUrl: './postulation.page.scss',
})
export class StudentPostulationPageComponent implements OnInit { 
  private readonly formBuilder = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef); 
  private readonly activeSemester = '2026-1';

  readonly currentUser: SessionUser | null;

  readonly postulationForm = this.formBuilder.nonNullable.group({
    fullName: [{ value: '', disabled: true }, [Validators.required]],
    rut: [{ value: '', disabled: true }, [Validators.required]],
    semester: [{ value: this.activeSemester, disabled: true }, [Validators.required]],
    gender: [{ value: 'MUJER' as Gender, disabled: true }, [Validators.required]],
    declaration: [false, [Validators.requiredTrue]],
  });

  isLoadingSolicitud = false;
  hasExistingPostulation = false; 
  isSubmitting = false;
  formMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly postulationService: SolicitudesService,
  ) {
    this.currentUser = this.authService.getCurrentUser();
    const user = this.currentUser as any; 

    this.postulationForm.patchValue({
      fullName: user?.fullName ?? '',
      rut: user?.rut ?? '',
      gender: user?.gender ?? 'MUJER',
      semester: this.activeSemester,
    });
  }

  ngOnInit(): void {
    this.loadMySolicitud();
  }

  submitPostulation(): void {
    if (this.postulationForm.invalid) {
      this.postulationForm.markAllAsTouched();
      this.formMessage = 'Revisa los campos y confirma la declaracion.';
      return;
    }

    this.formMessage = '';
    this.isSubmitting = true;

    const payloadParaBackend = {};

    this.postulationService
      .createSolicitud(payloadParaBackend)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges(); 
      }))
      .subscribe({
        next: () => {
          this.hasExistingPostulation = true; 
          this.postulationForm.disable(); 
          this.formMessage = '¡Postulacion enviada exitosamente!';
          this.cdr.detectChanges();
          setTimeout(() => {
            void this.router.navigate(['/student/home']);
          }, 2000); 
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 409) {
            this.formMessage = 'No se pudo guardar: ya existe postulacion para este semestre.';
            return;
          }

          if (error.status === 400) {
            this.formMessage = 'Datos inválidos o rechazados por el servidor. Verifica el formulario.';
            console.error('Detalle del rechazo (400):', error.error);
            return;
          }

          this.formMessage = 'No se pudo guardar la postulacion. Verifica el backend e intenta nuevamente.';
        },
      });
  }

  goBack(): void {
    void this.router.navigate(['/student/home']);
  }

  private loadMySolicitud(): void {
    this.isLoadingSolicitud = true;

    this.postulationService
      .getMySolicitud()
      .pipe(
        finalize(() => {
          this.isLoadingSolicitud = false;
          this.cdr.detectChanges(); 
        })
      )
      .subscribe({
        next: (solicitud: any) => {
          if (!solicitud || (Array.isArray(solicitud) && solicitud.length === 0)) {
            return;
          }

          this.hasExistingPostulation = true;
          this.postulationForm.disable();

          const dataReal = Array.isArray(solicitud) ? solicitud[0] : solicitud;
          const estadoReal = dataReal.estado || dataReal.Estado || dataReal.status || 'Desconocido';

          if (
            estadoReal === 'En Revision' || 
            estadoReal === 'Pendiente' || 
            estadoReal === 'En revision' || 
            estadoReal === 'EN_REVISION'
          ) {
            this.formMessage = 'Ya tienes una postulacion en curso. Seras redirigido al panel.';
            this.cdr.detectChanges();
            setTimeout(() => {
                void this.router.navigate(['/student/home']);
            }, 3000);
            return;
          }

          this.formMessage = `Ya tienes una postulacion registrada. Estado actual: ${estadoReal}.`;
          this.cdr.detectChanges();
        },
        error: () => {
        },
      });
  }
}