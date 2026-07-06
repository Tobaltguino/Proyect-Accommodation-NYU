import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';
import { SolicitudDTO, CambiarEstadoSolicitudRequest, VerificarMatriculaResponse } from '../../shared/models';

export type Gender = 'MUJER' | 'HOMBRE';
export type MealPlan = 'Sin preferencia' | 'Vegetariano' | 'Vegano';

@Injectable({ providedIn: 'root' })
export class SolicitudesService {
  private apiUrl = "http://localhost:3000";
  // private apiUrl = environment.apiUrl


  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  // ==========================================
  // ESTUDIANTE
  // ==========================================
  createSolicitud(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/solicitudes`, payload, { headers: this.getAuthHeaders() });
  }

  getMySolicitud(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/solicitudes/mia`, { headers: this.getAuthHeaders() });
  }

  getHistorialSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/solicitudes/all`, { headers: this.getAuthHeaders() });
  }

  // ==========================================
  // ADMINISTRADOR
  // ==========================================
  
  obtenerTodasLasSolicitudes(): Observable<SolicitudDTO[]> {
    return this.http.get<SolicitudDTO[]>(`${this.apiUrl}/solicitudes-admin`, {
      headers: this.getAuthHeaders()
    });
  }

  cambiarEstadoSolicitud(idSolicitud: number, nuevoEstado: string): Observable<SolicitudDTO> {
    const payload: CambiarEstadoSolicitudRequest = { estado: nuevoEstado };
    return this.http.patch<SolicitudDTO>(
      `${this.apiUrl}/solicitudes-admin/solicitudes-admin/${idSolicitud}`, 
      payload, 
      { headers: this.getAuthHeaders() }
    );
  }

  verificarMatricula(rut: string): Observable<VerificarMatriculaResponse> {
    return this.http.get<VerificarMatriculaResponse>(
      `${this.apiUrl}/matricula/${encodeURIComponent(rut)}/estado`, 
      { headers: this.getAuthHeaders() }
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) return new HttpHeaders();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}