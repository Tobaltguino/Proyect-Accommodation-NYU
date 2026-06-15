import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';
import {
  Gender,
  MealPlan,
  SolicitudResponse,
  StudentPostulationService,
} from './student-postulation.service';

@Component({
  selector: 'app-student-postulation-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './postulation.page.html',
  styleUrl: './postulation.page.scss',
})
export class StudentPostulationPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly activeSemester = '2026-1';

  readonly currentUser: SessionUser | null;

  readonly postulationForm = this.formBuilder.nonNullable.group({
    fullName: [{ value: '', disabled: true }, [Validators.required]],
    rut: [{ value: '', disabled: true }, [Validators.required]],
    semester: [{ value: this.activeSemester, disabled: true }, [Validators.required]],
    career: [{ value: '', disabled: true }, [Validators.required]],
    gender: [{ value: 'MUJER' as Gender, disabled: true }, [Validators.required]],
    mealPlan: ['Sin preferencia' as MealPlan, [Validators.required]],
    declaration: [false, [Validators.requiredTrue]],
  });

  isLoadingSolicitud = false;
  isSubmitting = false;
  hasPendingSolicitud = false;
  solicitudBlockTitle = 'Solicitud pendiente';
  solicitudBlockMessage =
    'Ya tienes una solicitud de alojamiento pendiente de revision. No puedes enviar una nueva postulacion hasta que sea resuelta.';
  formMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly postulationService: StudentPostulationService,
  ) {
    this.currentUser = this.authService.getCurrentUser();
    const user = this.currentUser as any; 

    this.postulationForm.patchValue({
      fullName: user?.fullName ?? '',
      rut: user?.rut ?? '',
      career: user?.career ?? 'No especificada', 
      gender: user?.gender ?? 'MUJER',
      semester: this.activeSemester,
    });

    this.loadMySolicitud();
  }

  saveDraft(): void {
    if (this.postulationForm.invalid) {
      this.postulationForm.markAllAsTouched();
      this.formMessage = 'Completa los campos obligatorios para guardar el borrador.';
      return;
    }

    this.formMessage = `Borrador local guardado exitosamente.`;
  }

  submitPostulation(): void {
    if (this.postulationForm.invalid) {
      this.postulationForm.markAllAsTouched();
      this.formMessage = 'Revisa los campos y confirma la declaracion.';
      return;
    }

    const payload = this.postulationForm.getRawValue();
    this.formMessage = '';

    if (this.hasPendingSolicitud) {
      this.formMessage = 'Ya tienes una postulacion registrada. Revisa su estado antes de continuar.';
      return;
    }

    this.isSubmitting = true;

    this.postulationService
      .createSolicitud({
        planAlimenticio: payload.mealPlan,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.syncFormWithSolicitud(response);
          void this.router.navigate(['/student/home']);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 409) {
            this.formMessage =
              'No se pudo guardar: ya existe postulacion para este semestre o no hay cupo.';
            return;
          }

          if (error.status === 400) {
            this.formMessage = 'Datos invalidos. Verifica el formulario y vuelve a intentar.';
            return;
          }

          this.formMessage =
            'No se pudo guardar la postulacion. Verifica el backend e intenta nuevamente.';
        },
      });
  }

  goBack(): void {
    void this.router.navigate(['/student/home']);
  }

  goToStatus(): void {
    void this.router.navigate(['/student/status'], {
      queryParams: { refresh: Date.now() },
    });
  }

  private loadMySolicitud(): void {
    this.isLoadingSolicitud = true;

    this.postulationService
      .getMySolicitud(this.activeSemester)
      .pipe(finalize(() => (this.isLoadingSolicitud = false)))
      .subscribe({
        next: (solicitud) => {
          if (!solicitud) {
            return;
          }

          const estado = solicitud.status ?? solicitud.estado;

          if (this.isBlockingEstado(estado)) {
            this.hasPendingSolicitud = true;
            this.postulationForm.disable();
            this.setSolicitudBlockMessage(estado);
            return;
          }

          this.hasPendingSolicitud = false;
          this.postulationForm.enable();
          this.postulationForm.controls.fullName.disable();
          this.postulationForm.controls.rut.disable();
          this.postulationForm.controls.semester.disable();
          this.postulationForm.controls.career.disable();
          this.postulationForm.controls.gender.disable();

          this.syncFormWithSolicitud(solicitud);
          this.formMessage =
            `Ya tienes una postulacion registrada. Estado actual: ${estado}.`;
        },
        error: () => {
          this.formMessage = 'No se pudo recuperar tu postulacion actual.';
        },
      });
  }

  private syncFormWithSolicitud(solicitud: SolicitudResponse): void {
    this.postulationForm.patchValue({
      career: solicitud.career,
      gender: solicitud.gender,
      mealPlan: solicitud.mealPlan ?? solicitud.planAlimenticio ?? solicitud.plan_alimenticio,
    });
  }

  private isBlockingEstado(estado: string | undefined): boolean {
    return (
      estado === 'EN_REVISION' ||
      estado === 'En Revision' ||
      estado === 'Pendiente' ||
      estado === 'APROBADA' ||
      estado === 'Aprobada'
    );
  }

  private setSolicitudBlockMessage(estado: string | undefined): void {
    if (estado === 'APROBADA' || estado === 'Aprobada') {
      this.solicitudBlockTitle = 'Solicitud aprobada';
      this.solicitudBlockMessage =
        'Tu postulacion ya fue aprobada. No puedes enviar una nueva postulacion para este semestre.';
      this.formMessage = 'Tu postulacion fue aprobada. Revisa el detalle en Estado de solicitud.';
      return;
    }

    this.solicitudBlockTitle = 'Solicitud pendiente';
    this.solicitudBlockMessage =
      'Ya tienes una solicitud de alojamiento pendiente de revision. No puedes enviar una nueva postulacion hasta que sea resuelta.';
    this.formMessage = 'Ya tienes una solicitud pendiente. Espera la evaluacion del equipo de residencia.';
  }
}
