import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';

import { SolicitudesService } from '../../../core/services/solicitudes.service';
import { AsignacionesService } from '../../../core/services/asignaciones.service';
import { IncidenciaService } from '../../../core/services/incidencia.service';
import { InfraestructuraService } from '../../../core/services/infraestructura.service';

import { EstadoSolicitud, EstadoAsignacion } from '../../../shared/models';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.scss',
  standalone: true,
  imports: [RouterModule]
})
export class AdminHomeComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  // Inyección de servicios de datos
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly asignacionesService = inject(AsignacionesService);
  private readonly incidenciaService = inject(IncidenciaService);
  private readonly infraestructuraService = inject(InfraestructuraService);

  readonly currentUser: SessionUser | null;

  isLoading: boolean = true;

  // Empezamos los contadores en 0
  stats = {
    pendingRequests: 0,
    activeIncidents: 0,
    totalStudents: 0,
    availableRooms: 0
  };

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.isLoading = true;

    // forkJoin ejecuta todas las llamadas al backend al mismo tiempo
    forkJoin({
      solicitudes: this.solicitudesService.obtenerTodasLasSolicitudes().pipe(catchError(() => of([]))),
      asignaciones: this.asignacionesService.obtenerTodas().pipe(catchError(() => of([]))),
      incidencias: this.incidenciaService.getIncidencias().pipe(catchError(() => of([]))),
      edificios: this.infraestructuraService.obtenerInfraestructuraCompleta().pipe(catchError(() => of([])))
    }).subscribe({
      next: (resultados) => {
        
        // 1. Solicitudes Pendientes (Filtramos solo las que están en estado "Pendiente")
        this.stats.pendingRequests = resultados.solicitudes.filter(
          s => s.estado === EstadoSolicitud.PENDIENTE || (s.estado as string).toLowerCase() === 'pendiente'
        ).length;

        // 2. Estudiantes Activos (Asignaciones que están "Activas")
        this.stats.totalStudents = resultados.asignaciones.filter(
          a => a.estado === EstadoAsignacion.ACTIVA
        ).length;

        // 3. Incidencias (Contamos todas las del periodo actual que trae el backend)
        this.stats.activeIncidents = resultados.incidencias.length;

        // 4. Habitaciones Disponibles (Recorremos los edificios y verificamos cupos)
        let habDisponibles = 0;
        resultados.edificios.forEach(edificio => {
          edificio.pisos?.forEach(piso => {
            piso.habitaciones?.forEach(hab => {
              // Sumamos solo si la habitación está habilitada y tiene al menos 1 cama libre
              if (hab.disponibilidad && (hab.capacidadActual < (hab.capacidadTotal || 0))) {
                habDisponibles++;
              }
            });
          });
        });
        this.stats.availableRooms = habDisponibles;

        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goTo(route: string): void {
    void this.router.navigate([`/admin/${route}`]);
  }
}