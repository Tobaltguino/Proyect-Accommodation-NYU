import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminStayManagementService {
  private readonly apiBaseUrl = 'http://localhost:3000/asignaciones';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) return new HttpHeaders();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // 1. Buscar al estudiante
  buscarResidentePorRut(rut: string): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/buscar-residente/${rut}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // 2. Marcar Check-In
  registrarCheckIn(idAsignacion: number): Observable<any> {
    return this.http.patch<any>(`${this.apiBaseUrl}/${idAsignacion}/check-in`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  // 3. Marcar Check-Out (Salida exitosa)
  registrarCheckOut(idAsignacion: number): Observable<any> {
    return this.http.patch<any>(`${this.apiBaseUrl}/${idAsignacion}/check-out`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  // 4. Renuncia (Salida anticipada)
  renunciarAsignacion(idAsignacion: number): Observable<any> {
    return this.http.patch<any>(`${this.apiBaseUrl}/${idAsignacion}/renunciar`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }
}