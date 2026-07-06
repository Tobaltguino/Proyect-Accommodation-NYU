import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

import { AsignacionDTO, AsignacionActivaResponse } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class CheckInOutService {
  private apiUrl = `${environment.apiUrl}/asignaciones`;
  
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) return new HttpHeaders();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Buscar al estudiante
  buscarResidentePorRut(rut: string): Observable<AsignacionActivaResponse> {
    return this.http.get<AsignacionActivaResponse>(`${this.apiUrl}/estudiantes/${rut}/activa`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Marcar Check-In
  registrarCheckIn(idAsignacion: number): Observable<AsignacionDTO> {
    return this.http.patch<AsignacionDTO>(`${this.apiUrl}/${idAsignacion}/ingresos`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Marcar Check-Out (Salida exitosa)
  registrarCheckOut(idAsignacion: number): Observable<AsignacionDTO> {
    return this.http.patch<AsignacionDTO>(`${this.apiUrl}/${idAsignacion}/salidas`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Renuncia (Salida anticipada)
  renunciarAsignacion(idAsignacion: number): Observable<AsignacionDTO> {
    return this.http.patch<AsignacionDTO>(`${this.apiUrl}/${idAsignacion}/renunciar`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }
}