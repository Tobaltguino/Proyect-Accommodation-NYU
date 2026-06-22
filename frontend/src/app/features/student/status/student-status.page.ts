import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, TimeoutError, timeout } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';
import { SolicitudResponse, StudentPostulationService } from '../postulation/student-postulation.service';

export interface MappedSolicitud extends SolicitudResponse {
  statusLabel: string;
  statusDescription: string;
  statusClass: string;
}

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

  solicitudes: MappedSolicitud[] = [];
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

  formatTimestamp(value: string | undefined): string {
    if (!value) return '-';
    
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  private mapSolicitudData(solicitud: SolicitudResponse, overrideId?: number): MappedSolicitud {
    let label = 'Expirada';
    let desc = 'La reserva asociada a tu solicitud expiró. Puedes iniciar una nueva postulación.';
    let cssClass = 'neutral';

    if (solicitud.estado === 'En Revision') {
      label = 'Pendiente';
      desc = 'Tu solicitud está en evaluación por el equipo de residencia.';
      cssClass = 'pending';
    } else if (solicitud.estado === 'Aprobada') {
      label = 'Aprobada';
      desc = 'Tu solicitud fue aprobada. Revisa los siguientes pasos en secretaría.';
      cssClass = 'approved';
    } else if (solicitud.estado === 'Rechazada') {
      label = 'Rechazada';
      desc = 'Tu solicitud fue rechazada. Puedes revisar observaciones con asistencia estudiantil.';
      cssClass = 'rejected';
    }

    return {
      ...solicitud,
      id: overrideId ?? Math.floor(Math.random() * 10000), 
      statusLabel: label,
      statusDescription: desc,
      statusClass: cssClass,
    };
  }

  private loadStatus(): void {
    this.isLoading = true;
    this.loadError = '';

    // Petición HTTP real al backend
    this.postulationService
      .getHistorialSolicitudes()
      .pipe(
        timeout({ first: this.requestTimeoutMs }),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (historialReal) => {
          // Si el backend responde bien, mapeamos la data y la mostramos
          this.solicitudes = historialReal.map((sol) => 
            this.mapSolicitudData(sol, sol.id)
          );
        },
        error: (error: unknown) => {
          this.loadError =
            error instanceof TimeoutError
              ? 'La consulta demoró demasiado. Intenta nuevamente.'
              : 'No se pudo consultar el historial de tus postulaciones. Verifica la conexión con el backend.';
        },
      });
  }
}