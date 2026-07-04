import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service'; 

import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CheckInOutService {
  private apiUrl = environment.apiUrl;
  

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
    return this.http.get<any>(`${this.apiUrl}/buscar-residente/${rut}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // 2. Marcar Check-In
  registrarCheckIn(idAsignacion: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${idAsignacion}/check-in`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  // 3. Marcar Check-Out (Salida exitosa)
  registrarCheckOut(idAsignacion: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${idAsignacion}/check-out`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  // 4. Renuncia (Salida anticipada)
  renunciarAsignacion(idAsignacion: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${idAsignacion}/renunciar`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }
}