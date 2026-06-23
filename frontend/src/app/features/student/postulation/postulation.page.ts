import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // Importamos OnInit y ChangeDetectorRef
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
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './postulation.page.html',
  styleUrl: './postulation.page.scss',
})
export class StudentPostulationPageComponent implements OnInit { // Implementamos OnInit
  private readonly formBuilder = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef); // Inyectamos el detector de cambios
  private readonly activeSemester = '2026-1';

  readonly currentUser: SessionUser | null;

  readonly postulationForm = this.formBuilder.nonNullable.group({
    fullName: [{ value: '', disabled: true }, [Validators.required]],
    rut: [{ value: '', disabled: true }, [Validators.required]],
    semester: [{ value: this.activeSemester, disabled: true }, [Validators.required]],
    career: [{ value: '', disabled: true }, [Validators.required]],
    gender: [{ value: 'MUJER' as Gender, disabled: true }, [Validators.required]],
    mealPlan: ['OMNIVORA' as MealPlan, [Validators.required]],
    declaration: [false, [Validators.requiredTrue]],
  });

  isLoadingSolicitud = false;
  hasExistingPostulation = false; 
  isSubmitting = false;
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
    // Quitamos la carga del constructor para evitar bloqueos en la navegación
  }

  // Iniciamos la carga en el ciclo de vida correcto
  ngOnInit(): void {
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
    this.isSubmitting = true;

    const payloadParaBackend: any = {
      planAlimenticio: payload.mealPlan,
    };

    this.postulationService
      .createSolicitud(payloadParaBackend)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges(); // Forzamos renderizado al terminar envío
      }))
      .subscribe({
        next: (response) => {
          this.syncFormWithSolicitud(response);
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
            this.formMessage =
              'No se pudo guardar: ya existe postulacion para este semestre o no hay cupo.';
            return;
          }

          if (error.status === 400) {
            this.formMessage = 'Datos invalidos o rechazados por el servidor. Verifica el formulario.';
            console.error('Detalle del rechazo (400):', error.error);
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

  private loadMySolicitud(): void {
    this.isLoadingSolicitud = true;

    this.postulationService
      .getMySolicitud(this.activeSemester)
      .pipe(
        finalize(() => {
          this.isLoadingSolicitud = false;
          this.cdr.detectChanges(); // Rompe el bucle visual de carga obligatoriamente aquí
        })
      )
      .subscribe({
        next: (solicitud: any) => {
          console.log('--- RESPUESTA REAL DEL BACKEND ---', solicitud);
          
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

          this.syncFormWithSolicitud(dataReal);
          this.formMessage = `Ya tienes una postulacion registrada. Estado actual: ${estadoReal}.`;
          this.cdr.detectChanges();
        },
        error: () => {
          this.formMessage = 'No se pudo recuperar tu postulacion actual.';
          this.cdr.detectChanges();
        },
      });
  }

  private syncFormWithSolicitud(solicitud: SolicitudResponse): void {
    this.postulationForm.patchValue({
      career: solicitud.career,
      gender: solicitud.gender,
      mealPlan: solicitud.mealPlan,
    });
  }
}