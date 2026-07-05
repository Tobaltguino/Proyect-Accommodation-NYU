import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, TimeoutError, timeout } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';
import { SolicitudesService } from '../../../core/services/solicitudes.service';

// Interfaz definida localmente sin depender de fuentes externas
export interface MappedSolicitud {
  id: number;
  semester: string;
  roomCode: string;
  updatedAt: string;
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
  private readonly requestTimeoutMs = 10000;
  private readonly cdr = inject(ChangeDetectorRef);

  readonly currentUser: SessionUser | null;

  solicitudes: MappedSolicitud[] = [];
  isLoading = true;
  loadError = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly postulationService: SolicitudesService,
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

  public formatTimestamp(value: string | undefined): string {
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

  private mapSolicitudData(solicitud: any): MappedSolicitud {
    // Leemos el estado exacto que llega del JSON
    const estadoReal = solicitud.estado || 'Pendiente';
    
    let label = 'Estado Desconocido';
    let desc = 'No se pudo determinar el estado actual.';
    let cssClass = 'neutral';

    // 1. Separamos "Pendiente" / "En Espera" para que no se confunda con "En Revision"
    if (estadoReal === 'Pendiente' || estadoReal === 'En Espera') {
      label = 'En Espera';
      desc = 'Tu solicitud ha sido recibida y está a la espera de evaluación.';
      cssClass = 'pending';
    } else if (estadoReal === 'En Revision') {
      label = 'En Revisión';
      desc = 'Tu solicitud está siendo evaluada por la administración.';
      cssClass = 'pending';
    } else if (estadoReal === 'Aprobada') {
      label = 'Aprobada';
      desc = 'Tu solicitud fue aprobada. Revisa los siguientes pasos.';
      cssClass = 'approved';
    } else if (estadoReal === 'Rechazada') {
      label = 'Rechazada';
      desc = 'Tu solicitud fue rechazada.';
      cssClass = 'rejected';
    } else if (estadoReal === 'Finalizada') {
      label = 'Finalizada';
      desc = 'El proceso ha concluido.';
      cssClass = 'neutral';
    }

    return {
      // Usamos exactamente las llaves del JSON
      id: Number(solicitud.idSolicitud),
      semester: String(solicitud.semester || 'Desconocido'),
      roomCode: String(solicitud.idAsignacion ?? '000'),
      updatedAt: solicitud.fechaSolicitud ?? new Date().toISOString(),
      
      statusLabel: label,
      statusDescription: desc,
      statusClass: cssClass,
    };
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
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (historialReal: any) => {
          if (!Array.isArray(historialReal)) {
            this.solicitudes = [];
          } else {
            // Mapeo directo con los datos ya corregidos
            this.solicitudes = historialReal.map((sol) => this.mapSolicitudData(sol));
          }
        },
        error: (error: unknown) => {
          this.loadError = error instanceof TimeoutError
              ? 'La consulta demoró demasiado.'
              : 'Error al consultar el historial.';
          console.error('Error al cargar historial:', error);
        },
      });
  }
}