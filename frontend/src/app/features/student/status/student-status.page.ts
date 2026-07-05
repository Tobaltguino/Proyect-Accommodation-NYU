import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core'; // <-- Importamos ChangeDetectorRef e inject
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
export class StudentStatusPageComponent implements OnInit {
  private readonly activeSemester = '2026-1';
  private readonly requestTimeoutMs = 10000;
  private readonly cdr = inject(ChangeDetectorRef); // <-- Inyectamos el detector de cambios

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
  }

  ngOnInit(): void {
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

  private mapSolicitudData(solicitud: any, overrideId?: number): MappedSolicitud {
    const estadoReal = solicitud.estado || 'Pendiente';
    
    let label = 'Expirada';
    let desc = 'La reserva asociada a tu solicitud expiró. Puedes iniciar una nueva postulación.';
    let cssClass = 'neutral';

    if (estadoReal === 'En Revision' || estadoReal === 'Pendiente') {
      label = 'En Revisión';
      desc = 'Tu solicitud ha sido recibida y está en evaluación por el equipo de residencia.';
      cssClass = 'pending';
    } else if (estadoReal === 'Aprobada') {
      label = 'Aprobada';
      desc = 'Tu solicitud fue aprobada. Revisa los siguientes pasos en secretaría.';
      cssClass = 'approved';
    } else if (estadoReal === 'Rechazada') {
      label = 'Rechazada';
      desc = 'Tu solicitud fue rechazada. Puedes revisar las observaciones con asistencia estudiantil.';
      cssClass = 'rejected';
    } else if (estadoReal === 'Finalizada') {
      label = 'Finalizada';
      desc = 'Este proceso de postulación ya ha concluido.';
      cssClass = 'neutral';
    }

    return {
      ...solicitud,
      id: overrideId ?? solicitud.idSolicitud ?? Math.floor(Math.random() * 10000), 
      semester: String(solicitud.idPeriodo ?? 'Desconocido'),
      roomCode: String(solicitud.idAsignacion ?? '000'),
      updatedAt: solicitud.fechaSolicitud ?? new Date().toISOString(),
      
      statusLabel: label,
      statusDescription: desc,
      statusClass: cssClass,
    } as MappedSolicitud;
  }

  private loadStatus(): void {
    this.isLoading = true;
    this.loadError = '';

    this.postulationService
      .getHistorialSolicitudes()
      .pipe(
        timeout({ first: this.requestTimeoutMs }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges(); // <-- Forzamos actualización visual al terminar
        }),
      )
      .subscribe({
        next: (historialReal: any) => {
          if (!historialReal || !Array.isArray(historialReal)) {
            this.solicitudes = [];
          } else {
            this.solicitudes = historialReal.map((sol) => 
              this.mapSolicitudData(sol, sol.idSolicitud ?? sol.id)
            );
          }
          this.cdr.detectChanges(); // <-- Refrescamos la lista en pantalla
        },
        error: (error: unknown) => {
          this.loadError =
            error instanceof TimeoutError
              ? 'La consulta demoró demasiado. Intenta nuevamente.'
              : 'No se pudo consultar el historial de tus postulaciones. Verifica la conexión con el backend.';
          this.cdr.detectChanges(); // <-- Refrescamos el mensaje de error en pantalla
          console.error('Error al cargar historial:', error);
        },
      });
  }
}