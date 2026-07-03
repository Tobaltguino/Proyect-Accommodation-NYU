import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminRequestsService {
  private readonly apiBaseUrl = 'http://localhost:3000';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  // 1. Obtiene todas las solicitudes para llenar la tabla
  obtenerTodasLasSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/solicitudes-admin/todas`, {
      headers: this.getAuthHeaders()
    });
  }

  // 2. Actualiza el estado cuando el admin presiona "Rechazar" o cambia a "En Revisión"
  cambiarEstadoSolicitud(idSolicitud: number, nuevoEstado: string): Observable<any> {
    const payload = { estado: nuevoEstado };
    
    return this.http.patch<any>(
      `${this.apiBaseUrl}/solicitudes-admin/idSolicitud/${idSolicitud}`, 
      payload, 
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  // 3. Crea la asignación (y aprueba la solicitud automáticamente en el backend)
  crearAsignacion(idSolicitud: number, idHabitacion: number): Observable<any> {
    const payload = { idSolicitud, idHabitacion };
    
    return this.http.post<any>(
      `${this.apiBaseUrl}/asignaciones`,
      payload,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  // 4. Genera el pase VIP (Token JWT)
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}