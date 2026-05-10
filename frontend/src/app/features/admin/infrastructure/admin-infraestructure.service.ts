import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Aquí deberás importar el DTO o modelo real de tus solicitudes
// import { SolicitudDTO } from '../../../shared/models'; 

@Injectable({
  providedIn: 'root'
})
export class AdminRequestsService {

  // URL Base que sacamos del @Controller('solicitudes-admin')
  private readonly API_URL = 'http://localhost:3000/solicitudes-admin';

  constructor(private http: HttpClient) {}

  /**
   * Conecta con: @Get('periodo/:idPeriodo')
   * URL resultante: http://localhost:3000/solicitudes-admin/periodo/{id}
   */
  obtenerSolicitudesPorPeriodo(idPeriodo: number): Observable<any[]> { 
    // Nota: Reemplaza "any[]" por "SolicitudDTO[]" cuando tengas tu modelo creado
    return this.http.get<any[]>(`${this.API_URL}/periodo/${idPeriodo}`);
  }
}