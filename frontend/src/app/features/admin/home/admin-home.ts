import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, switchMap, map, catchError, of } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.scss',
  standalone: true,
  imports: [RouterModule]
})
export class AdminHomeComponent implements OnInit {
  readonly currentUser: SessionUser | null;
  
  // Inyectamos el HttpClient directamente para orquestar este Dashboard centralizado
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private readonly apiUrl = 'http://localhost:3000';

  // Inicializamos el objeto en 0 para que no salte de golpe
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
   ///Use RxJS para hacer multiples llamados HTTP

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  //Se realiza una peticion secuencial, se pregunta por el periodo actual primero ya que no se puede traer estadisticas de los residentes
  //o solicitudes si no se de que semestre hablamos
  cargarEstadisticas(): void {
    const headers = this.getHeaders();

    // 1. Obtener el Periodo Académico Actual
    this.http.get<any>(`${this.apiUrl}/periodos/actual`, { headers }).pipe(
      switchMap((periodo) => {
        const idPeriodo = periodo?.idPeriodo;
        if (!idPeriodo) {
          throw new Error('No hay periodo académico activo en el sistema.');
        }

        // Ejecutar las 4 peticiones en paralelo usando forkJoin
        return forkJoin({
          solicitudes: this.http.get<any[]>(`${this.apiUrl}/solicitudes-admin/periodo/${idPeriodo}`, { headers }).pipe(
            map(solicitudes => solicitudes.filter(s => s.estado === 'Pendiente').length),
            catchError(() => of(0))  // Si falla, devuelve 0 
          ),
          incidencias: this.http.get<any[]>(`${this.apiUrl}/incidencias`, { headers }).pipe(
            map(incidencias => incidencias.filter(i => i.estado === 'Pendiente' || i.estado === 'En Proceso').length),
            catchError(() => of(0))
          ),
          residentes: this.http.get<any>(`${this.apiUrl}/asignaciones/residentes-activos/${idPeriodo}`, { headers }).pipe(
            map(res => res.total || 0),
            catchError(() => of(0))
          ),
          habitaciones: this.http.get<any>(`${this.apiUrl}/habitaciones/disponibles/total`, { headers }).pipe(
            map(res => res.total || 0),
            catchError(() => of(0))
          )
        });
      }),
      catchError(error => {
        console.error('Error al cargar las estadísticas del dashboard:', error);
        // Retornamos 0 globalmente en caso de que, por ejemplo, el backend no responda o no exista un periodo actual.
        return of({ solicitudes: 0, incidencias: 0, residentes: 0, habitaciones: 0 });
      })
    ).subscribe(data => {
      //  Asignamos la recolección terminada a nuestro objeto "stats"
      this.stats = {
        pendingRequests: data.solicitudes,
        activeIncidents: data.incidencias,
        totalStudents: data.residentes,
        availableRooms: data.habitaciones
      };
      
      //  Aseguramos que la vista se actualize  con los nuevos valores
      this.cdr.detectChanges();
    });
  }

  goTo(route: string): void {
    void this.router.navigate([`/admin/${route}`]);
  }
}