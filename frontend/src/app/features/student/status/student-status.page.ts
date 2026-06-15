import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take, TimeoutError, timeout } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';
import { AsignacionDTO } from '../../../shared/models';
import { SolicitudResponse, StudentPostulationService } from '../postulation/student-postulation.service';

@Component({
  selector: 'app-student-status-page',
  imports: [CommonModule],
  templateUrl: './student-status.page.html',
  styleUrl: './student-status.page.scss',
})
export class StudentStatusPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly activeSemester = '2026-1';
  private readonly requestTimeoutMs = 10000;

  readonly currentUser: SessionUser | null;

  solicitud: SolicitudResponse | null = null;
  asignacion: AsignacionDTO | null = null;
  isLoading = true;
  loadError = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly postulationService: StudentPostulationService,
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadStatus();
      });
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
    const estado = this.normalizedStatus;

    if (estado === 'pending') {
      return 'Pendiente';
    }

    if (estado === 'approved') {
      return 'Aprobada';
    }

    if (estado === 'rejected') {
      return 'Rechazada';
    }

    return 'Sin postulacion';
  }

  get statusDescription(): string {
    const estado = this.normalizedStatus;

    if (estado === 'none') {
      return 'Aun no envias una postulacion para este semestre.';
    }

    if (estado === 'pending') {
      return 'Tu solicitud esta en evaluacion por el equipo de residencia.';
    }

    if (estado === 'approved') {
      return 'Tu solicitud fue aprobada. Ya puedes revisar tu asignacion e historial de residencia.';
    }

    if (estado === 'rejected') {
      return 'Tu solicitud fue rechazada. Puedes revisar observaciones con asistencia estudiantil.';
    }

    return 'No se pudo determinar el estado actual de tu postulacion.';
  }

  get statusClass(): 'pending' | 'approved' | 'rejected' | 'neutral' {
    const estado = this.normalizedStatus;

    if (estado === 'pending') {
      return 'pending';
    }

    if (estado === 'approved') {
      return 'approved';
    }

    if (estado === 'rejected') {
      return 'rejected';
    }

    return 'neutral';
  }

  get periodoLabel(): string {
    return (
      this.asignacion?.nombrePeriodo ??
      this.solicitud?.nombrePeriodo ??
      this.solicitud?.semester ??
      this.solicitud?.idPeriodo?.toString() ??
      '-'
    );
  }

  get planAlimenticioLabel(): string {
    return this.solicitud?.mealPlan ?? this.solicitud?.planAlimenticio ?? this.solicitud?.plan_alimenticio ?? '-';
  }

  get updatedAtLabel(): string {
    return this.solicitud?.updatedAt ?? this.solicitud?.fechaSolicitud ?? '';
  }

  get fechaAsignacionLabel(): string {
    return this.asignacion?.fechaAsignacion ?? '';
  }

  get habitacionLabel(): string {
    return this.asignacion?.numeroHabitacion ?? '-';
  }

  get edificioLabel(): string {
    return this.asignacion?.nombreEdificio ?? '-';
  }

  get pisoLabel(): string {
    return this.asignacion?.nombrePiso ?? this.asignacion?.numeroPiso?.toString() ?? '-';
  }

  get ubicacionLabel(): string {
    return this.asignacion?.ubicacionEdificio ?? '-';
  }

  get estadoAsignacionLabel(): string {
    return this.asignacion?.estado ?? '-';
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

    if (!this.authService.getToken()) {
      this.solicitud = null;
      this.asignacion = null;
      this.loadError = 'Tu sesion expiro. Vuelve a iniciar sesion.';
      this.isLoading = false;
      return;
    }

    this.postulationService
      .getMySolicitud(this.activeSemester)
      .pipe(
        take(1),
        timeout({ first: this.requestTimeoutMs }),
      )
      .subscribe({
        next: (solicitud) => {
          this.solicitud = solicitud;
          this.asignacion = solicitud?.asignacion ?? null;
          this.isLoading = false;
        },
        error: (error: unknown) => {
          this.solicitud = null;
          this.asignacion = null;
          this.loadError =
            error instanceof TimeoutError
              ? 'La consulta demoro demasiado. Intenta nuevamente.'
              : 'No se pudo consultar el estado de tu postulacion.';
          this.isLoading = false;
        },
      });
  }

  private get normalizedStatus(): 'pending' | 'approved' | 'rejected' | 'none' | 'unknown' {
    const rawStatus = this.solicitud?.status ?? this.solicitud?.estado;

    if (!rawStatus) {
      return 'none';
    }

    if (rawStatus === 'EN_REVISION' || rawStatus === 'En Revision' || rawStatus === 'Pendiente') {
      return 'pending';
    }

    if (rawStatus === 'APROBADA' || rawStatus === 'Aprobada') {
      return 'approved';
    }

    if (rawStatus === 'RECHAZADA' || rawStatus === 'Rechazada') {
      return 'rejected';
    }

    return 'unknown';
  }
}
