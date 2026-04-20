import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';
import {
  SolicitudResponse,
  StudentPostulationService,
} from '../postulation/student-postulation.service';

@Component({
  selector: 'app-student-home-page',
  templateUrl: './student-home.page.html',
  styleUrl: './student-home.page.scss',
})
export class StudentHomePageComponent {
  private readonly activeSemester = '2026-1';
  private readonly statusRequestTimeoutMs = 10000;

  readonly currentUser: SessionUser | null;

  postulationStatusLabel = 'Cargando estado...';
  postulationStatusClass: 'pending' | 'approved' | 'rejected' = 'pending';
  isPostulationLocked = false;

  infoMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly postulationService: StudentPostulationService,
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.loadCurrentPostulationStatus();
  }

  goToPostulation(): void {
    if (this.isPostulationLocked) {
      this.infoMessage =
        'Ya tienes una postulacion en revision. Espera su resolucion para volver a postular.';
      return;
    }

    void this.router.navigate(['/student/postulation']);
  }

  showSoon(section: string): void {
    this.infoMessage = `${section} estara disponible pronto.`;
  }

  goToStatus(): void {
    void this.router.navigate(['/student/status']);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  private loadCurrentPostulationStatus(): void {
    this.postulationService
      .getMySolicitud(this.activeSemester)
      .pipe(timeout({ first: this.statusRequestTimeoutMs }))
      .subscribe({
        next: (solicitud) => {
          if (!solicitud) {
            this.postulationStatusLabel = 'Sin postulacion enviada';
            this.postulationStatusClass = 'pending';
            this.isPostulationLocked = false;
            return;
          }

          this.applyStatusPresentation(solicitud.status);
          this.isPostulationLocked = solicitud.status === 'EN_REVISION';
        },
        error: () => {
          this.postulationStatusLabel = 'No disponible';
          this.postulationStatusClass = 'pending';
          this.isPostulationLocked = false;
        },
      });
  }

  private applyStatusPresentation(status: SolicitudResponse['status']): void {
    if (status === 'EN_REVISION') {
      this.postulationStatusLabel = 'Pendiente';
      this.postulationStatusClass = 'pending';
      return;
    }

    if (status === 'APROBADA') {
      this.postulationStatusLabel = 'Aprobada';
      this.postulationStatusClass = 'approved';
      return;
    }

    if (status === 'RECHAZADA') {
      this.postulationStatusLabel = 'Rechazada';
      this.postulationStatusClass = 'rejected';
      return;
    }

    this.postulationStatusLabel = 'Expirada';
    this.postulationStatusClass = 'rejected';
  }
}
