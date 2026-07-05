import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';


export type Gender = 'MUJER' | 'HOMBRE';
export type MealPlan = 'Sin preferencia' | 'Vegetariano' | 'Vegano';

@Injectable({ providedIn: 'root' })
export class StudentPostulationService {

  private apiUrl = `${environment.apiUrl}`;


  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) { }

  // POST: Enviar nueva solicitud
  createSolicitud(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/solicitudes`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  // GET: Obtener la solicitud del semestre actual (ya no requiere el semestre por parámetro)
  getMySolicitud(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/solicitudes/mia`, {
      headers: this.getAuthHeaders(),
    });
  }

  // GET: Obtener todo el historial
  getHistorialSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/solicitudes/all`, {
      headers: this.getAuthHeaders(),
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}