import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, TimeoutError, timeout } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';
import { SolicitudResponse, StudentPostulationService } from '../postulation/student-postulation.service';

@Component({
  selector: 'app-student-status-page',
  imports: [CommonModule],
  templateUrl: './student-status.page.html',
  styleUrl: './student-status.page.scss',
})
export class StudentStatusPageComponent {
  private readonly activeSemester = '2026-1';
  private readonly requestTimeoutMs = 10000;

  readonly currentUser: SessionUser | null;

  solicitud: SolicitudResponse | null = null;
  isLoading = true;
  loadError = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly postulationService: StudentPostulationService,
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStatus();
  }

  goBack(): void {
    void this.router.navigate(['/student/home']);
  }

  goToPostulation(): void {
    void this.router.navigate(['/student/postulation']);
  }

  retry(): void {
    this.loadStatus();
  }

  get statusLabel(): string {
    if (!this.solicitud) {
      return 'Sin postulacion';
    }

    if (this.solicitud.status === 'EN_REVISION') {
      return 'Pendiente';
    }

    if (this.solicitud.status === 'APROBADA') {
      return 'Aprobada';
    }

    if (this.solicitud.status === 'RECHAZADA') {
      return 'Rechazada';
    }

    return 'Expirada';
  }

  get statusDescription(): string {
    if (!this.solicitud) {
      return 'Aun no envias una postulacion para este semestre.';
    }

    if (this.solicitud.status === 'EN_REVISION') {
      return 'Tu solicitud esta en evaluacion por el equipo de residencia.';
    }

    if (this.solicitud.status === 'APROBADA') {
      return 'Tu solicitud fue aprobada. Revisa los siguientes pasos en secretaria.';
    }

    if (this.solicitud.status === 'RECHAZADA') {
      return 'Tu solicitud fue rechazada. Puedes revisar observaciones con asistencia estudiantil.';
    }

    return 'La reserva asociada a tu solicitud expiro. Puedes iniciar una nueva postulacion.';
  }

  get statusClass(): 'pending' | 'approved' | 'rejected' | 'neutral' {
    if (!this.solicitud) {
      return 'neutral';
    }

    if (this.solicitud.status === 'EN_REVISION') {
      return 'pending';
    }

    if (this.solicitud.status === 'APROBADA') {
      return 'approved';
    }

    return 'rejected';
  }

  formatTimestamp(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  private loadStatus(): void {
    this.isLoading = true;
    this.loadError = '';

    this.postulationService
      .getMySolicitud(this.activeSemester)
      .pipe(
        timeout({ first: this.requestTimeoutMs }),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (solicitud) => {
          this.solicitud = solicitud;
        },
        error: (error: unknown) => {
          this.solicitud = null;
          this.loadError =
            error instanceof TimeoutError
              ? 'La consulta demoro demasiado. Intenta nuevamente.'
              : 'No se pudo consultar el estado de tu postulacion.';
        },
      });
  }
}
