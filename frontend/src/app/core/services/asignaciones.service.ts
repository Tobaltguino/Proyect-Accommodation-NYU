import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { AsignacionDTO } from '../../shared/models';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AsignacionesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private apiUrl = `${environment.apiUrl}/asignaciones`;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ADMINISTRADOR

  crearAsignacion(idSolicitud: number, idHabitacion: number): Observable<any> {
    const payload = { idSolicitud, idHabitacion };
    return this.http.post(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  obtenerTodas(): Observable<AsignacionDTO[]> {
    return this.http.get<AsignacionDTO[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerAsignacionActivaPorRut(rut: string): Observable<{ tieneAsignacion: boolean; message?: string; asignacion?: AsignacionDTO }> {
    return this.http.get<{ tieneAsignacion: boolean; message?: string; asignacion?: AsignacionDTO }>(
      `${this.apiUrl}/estudiante/${encodeURIComponent(rut)}/activa`,
      { headers: this.getHeaders() }
    );
  }

  obtenerPorPeriodo(idPeriodo: number): Observable<AsignacionDTO[]> {
    return this.http.get<AsignacionDTO[]>(`${this.apiUrl}/periodo/${idPeriodo}`, { headers: this.getHeaders() });
  }

  reasignarHabitacion(idAsignacion: number, idNuevaHabitacion: number): Observable<any> {
    const payload = { idNuevaHabitacion };
    return this.http.patch(`${this.apiUrl}/${idAsignacion}/reasignar`, payload, { headers: this.getHeaders() });
  }

  renunciarAsignacion(idAsignacion: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${idAsignacion}/renunciar`, {}, { headers: this.getHeaders() });
  }

  // ESTUDIANTE

  obtenerMiAsignacion(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mi-asignacion`, { headers: this.getHeaders() });
  }

  obtenerMiHistorial(): Observable<AsignacionDTO[]> {
    return this.http.get<AsignacionDTO[]>(`${this.apiUrl}/mi-historial`, { headers: this.getHeaders() });
  }
}
