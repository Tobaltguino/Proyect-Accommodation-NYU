import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';
import { AsignacionDTO } from '../../../shared/models';
import { SolicitudResponse, StudentPostulationService } from '../postulation/student-postulation.service';

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-home.page.html',
  styleUrl: './student-home.page.scss'
})
export class StudentHomePageComponent implements OnInit {
  private readonly activeSemester = '2026-1';

  currentUser: SessionUser | null = null;
  solicitud: SolicitudResponse | null = null;
  asignacion: AsignacionDTO | null = null;
  isLoading = true;
  loadError = '';

  tieneAsignacion = false;
  periodoLabel = '-';
  planAlimenticioLabel = '-';

  miAsignacion: {
    edificio: string;
    piso: string;
    habitacion: string;
  } = {
    edificio: '-',
    piso: '-',
    habitacion: '-'
  };

  constructor(
    private authService: AuthService,
    private readonly postulationService: StudentPostulationService,
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadMyAssignment();
  }

  private loadMyAssignment(): void {
    this.isLoading = true;
    this.loadError = '';

    this.postulationService.getMySolicitud(this.activeSemester).subscribe({
      next: (solicitud) => {
        this.solicitud = solicitud;
        this.asignacion = solicitud?.asignacion ?? null;
        this.tieneAsignacion = Boolean(this.asignacion);
        this.periodoLabel =
          this.asignacion?.nombrePeriodo ??
          solicitud?.nombrePeriodo ??
          solicitud?.semester ??
          solicitud?.idPeriodo?.toString() ??
          '-';
        this.planAlimenticioLabel =
          solicitud?.mealPlan ?? solicitud?.planAlimenticio ?? solicitud?.plan_alimenticio ?? '-';
        this.miAsignacion = {
          edificio: this.asignacion?.nombreEdificio ?? '-',
          piso: this.asignacion?.nombrePiso ?? this.asignacion?.numeroPiso?.toString() ?? '-',
          habitacion: this.asignacion?.numeroHabitacion ?? '-',
        };
        this.isLoading = false;
      },
      error: () => {
        this.solicitud = null;
        this.asignacion = null;
        this.tieneAsignacion = false;
        this.loadError = 'No se pudo cargar tu asignacion actual.';
        this.isLoading = false;
      },
    });
  }
}
