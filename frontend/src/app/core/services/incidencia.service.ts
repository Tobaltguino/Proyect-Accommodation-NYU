import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import {
  CreateIncidenciaRequest,
  IncidenciaApiResponse,
  IncidenciaFilters,
} from '../../shared/models';

import { environment } from '../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class IncidenciaService {
  private apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  createIncidencia(payload: CreateIncidenciaRequest): Observable<IncidenciaApiResponse> {
    return this.http.post<IncidenciaApiResponse>(`${this.apiUrl}/incidencias`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  getIncidencias(filters: IncidenciaFilters = {}): Observable<IncidenciaApiResponse[]> {
    let params = new HttpParams();

    if (filters.semester) {
      params = params.set('semester', filters.semester);
    }

    if (filters.gravedad) {
      params = params.set('gravedad', filters.gravedad);
    }

    if (filters.rut) {
      params = params.set('rut', filters.rut);
    }

    return this.http.get<IncidenciaApiResponse[]>(`${this.apiUrl}/incidencias`, {
      headers: this.getAuthHeaders(),
      params,
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