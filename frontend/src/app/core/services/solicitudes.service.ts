import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EstadoSolicitud, SolicitudDTO } from '../../shared/models';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private apiUrl = 'http://localhost:3000/solicitudes-admin';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerTodasAdmin(): Observable<SolicitudDTO[]> {
    return this.http.get<SolicitudDTO[]>(`${this.apiUrl}/todas`, { headers: this.getHeaders() });
  }

  cambiarEstadoAdmin(idSolicitud: number, estado: EstadoSolicitud): Observable<SolicitudDTO> {
    return this.http.patch<SolicitudDTO>(
      `${this.apiUrl}/idSolicitud/${idSolicitud}`,
      { estado },
      { headers: this.getHeaders() }
    );
  }
}
