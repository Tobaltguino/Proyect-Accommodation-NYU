import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import {
  IncidenciaApiResponse,
  IncidenciaFilters,
  UpdateIncidenciaEstadoRequest,
} from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class AdminIncidentsService {
  private readonly apiBaseUrl = 'http://localhost:3000';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getIncidencias(filters: IncidenciaFilters = {}): Observable<IncidenciaApiResponse[]> {
    let params = new HttpParams();

    if (filters.semester) {
      params = params.set('semester', filters.semester);
    }

    if (filters.estado) {
      params = params.set('estado', filters.estado);
    }

    if (filters.gravedad) {
      params = params.set('gravedad', filters.gravedad);
    }

    if (filters.rut) {
      params = params.set('rut', filters.rut);
    }

    return this.http.get<IncidenciaApiResponse[]>(`${this.apiBaseUrl}/incidencias`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  updateEstadoIncidencia(
    incidenciaId: number,
    payload: UpdateIncidenciaEstadoRequest,
  ): Observable<IncidenciaApiResponse> {
    return this.http.patch<IncidenciaApiResponse>(
      `${this.apiBaseUrl}/incidencias/${incidenciaId}/estado`,
      payload,
      {
        headers: this.getAuthHeaders(),
      },
    );
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
