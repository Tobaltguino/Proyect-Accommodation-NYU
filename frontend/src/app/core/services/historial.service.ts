import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { HistorialResidenciaDTO, TipoMovimientoHistorial } from '../../shared/models';

export interface HistorialAdminFilters {
  rutEstudiante?: string;
  tipoMovimiento?: TipoMovimientoHistorial | '';
  fechaDesde?: string;
  fechaHasta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private apiUrl = 'http://localhost:3000/historial';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerMiHistorial(): Observable<HistorialResidenciaDTO[]> {
    return this.http.get<HistorialResidenciaDTO[]>(`${this.apiUrl}/mi-historial`, {
      headers: this.getHeaders()
    });
  }

  obtenerHistorialAdmin(filters: HistorialAdminFilters): Observable<HistorialResidenciaDTO[]> {
    const params: Record<string, string> = {};

    if (filters.rutEstudiante?.trim()) {
      params['rutEstudiante'] = filters.rutEstudiante.trim();
    }

    if (filters.tipoMovimiento) {
      params['tipoMovimiento'] = filters.tipoMovimiento;
    }

    if (filters.fechaDesde) {
      params['fechaDesde'] = filters.fechaDesde;
    }

    if (filters.fechaHasta) {
      params['fechaHasta'] = filters.fechaHasta;
    }

    return this.http.get<HistorialResidenciaDTO[]>(`${this.apiUrl}/admin`, {
      headers: this.getHeaders(),
      params,
    });
  }
}
