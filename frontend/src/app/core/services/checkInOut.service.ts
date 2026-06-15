import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AsignacionDTO } from '../../shared/models';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CheckInOutService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private apiUrl = 'http://localhost:3000/checkin';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  registrarCheckIn(idAsignacion: number, fecha: string): Observable<AsignacionDTO> {
    return this.http.patch<AsignacionDTO>(
      `${this.apiUrl}/${idAsignacion}`,
      { fecha },
      { headers: this.getHeaders() }
    );
  }
}
