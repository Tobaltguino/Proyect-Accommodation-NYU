import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';
import {
  BuildingAvailability,
  Gender,
  MealPlan,
  RoomAvailability,
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
    career: ['', [Validators.required]],
    semester: [{ value: this.activeSemester, disabled: true }, [Validators.required]],
    gender: ['MUJER' as Gender, [Validators.required]],
    phone: ['', [Validators.required]],
    city: ['', [Validators.required]],
    mealPlan: ['OMNIVORA' as MealPlan, [Validators.required]],
    roomCode: ['', [Validators.required]],
    motivation: ['', [Validators.required, Validators.minLength(15)]],
    declaration: [false, [Validators.requiredTrue]],
  });

  selectedBuilding: BuildingAvailability | null = null;
  isLoadingAvailability = false;
  isLoadingSolicitud = false;
  isSubmitting = false;
  formMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly postulationService: StudentPostulationService,
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.postulationForm.patchValue({
      fullName: this.currentUser?.fullName ?? '',
      rut: this.currentUser?.rut ?? '',
      semester: this.activeSemester,
    });

    this.postulationForm.controls.gender.valueChanges.subscribe((gender) => {
      this.postulationForm.controls.roomCode.setValue('');
      this.loadAvailability(gender);
      this.formMessage = '';
    });

    this.loadMySolicitud();
    this.loadAvailability(this.postulationForm.controls.gender.value);
  }

  saveDraft(): void {
    if (this.postulationForm.invalid) {
      this.postulationForm.markAllAsTouched();
      this.formMessage = 'Completa los campos obligatorios para guardar el borrador.';
      return;
    }

    const { roomCode } = this.postulationForm.getRawValue();
    this.formMessage = `Borrador local listo. Habitacion seleccionada: ${roomCode}.`;
  }

  submitPostulation(): void {
    if (this.postulationForm.invalid) {
      this.postulationForm.markAllAsTouched();
      this.formMessage = 'Revisa los campos y confirma la declaracion.';
      return;
    }

    const payload = this.postulationForm.getRawValue();
    this.formMessage = '';
    this.isSubmitting = true;

    this.postulationService
      .createSolicitud({
        career: payload.career,
        gender: payload.gender,
        phone: payload.phone,
        city: payload.city,
        mealPlan: payload.mealPlan,
        roomCode: payload.roomCode,
        motivation: payload.motivation,
        semester: this.activeSemester,
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

  selectRoom(room: RoomAvailability): void {
    if (room.occupiedBeds >= room.totalBeds) {
      return;
    }

    this.postulationForm.controls.roomCode.setValue(room.code);
    this.postulationForm.controls.roomCode.markAsTouched();
    this.formMessage = '';
  }

  isSelectedRoom(roomCode: string): boolean {
    return this.postulationForm.controls.roomCode.value === roomCode;
  }

  private loadAvailability(gender: Gender): void {
    this.isLoadingAvailability = true;

    this.postulationService
      .getAvailability(gender, this.activeSemester)
      .pipe(finalize(() => (this.isLoadingAvailability = false)))
      .subscribe({
        next: (response) => {
          this.selectedBuilding = response.building;
        },
        error: () => {
          this.selectedBuilding = null;
          this.formMessage = 'No se pudo cargar disponibilidad de habitaciones.';
        },
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

          if (solicitud.status === 'EN_REVISION') {
            this.formMessage =
              'Ya tienes una postulacion en revision. Seras redirigido al panel.';
            void this.router.navigate(['/student/home']);
            return;
          }

          this.syncFormWithSolicitud(solicitud);
          this.formMessage =
            `Ya tienes una postulacion registrada. Estado actual: ${solicitud.status}.`;
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
      phone: solicitud.phone,
      city: solicitud.city,
      mealPlan: solicitud.mealPlan,
      roomCode: solicitud.roomCode,
      motivation: solicitud.motivation,
    });
  }
}
