import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  EdificioDTO, 
  PisoDTO, 
  HabitacionDTO, 
  HabitacionDetalleDTO, 
  CrearPisoRequest, 
  CrearHabitacionRequest 
} from '../../shared/models';
import { AuthService } from '../auth/auth.service'; 

@Injectable({
  providedIn: 'root'
})
export class InfraestructuraService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private apiUrl = `${environment.apiUrl}`;

  public cacheEdificios: EdificioDTO[] = [];
  public cacheEdificioSeleccionado: EdificioDTO | null = null;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // EDIFICIOS

  obtenerInfraestructuraCompleta(): Observable<EdificioDTO[]> {
    return this.http.get<EdificioDTO[]>(`${this.apiUrl}/edificios/infraestructura`, { headers: this.getHeaders() });
  }

  obtenerInfraestructuraCompletaPorGenero(genero: string): Observable<EdificioDTO[]> {
    return this.http.get<EdificioDTO[]>(`${this.apiUrl}/edificios/infraestructura/${genero}`, { headers: this.getHeaders() });
  }

  obtenerTodosLosEdificios(): Observable<EdificioDTO[]> {
    return this.http.get<EdificioDTO[]>(`${this.apiUrl}/edificios`, { headers: this.getHeaders() });
  }

  obtenerEdificiosPorGenero(genero: string): Observable<EdificioDTO[]> {
    return this.http.get<EdificioDTO[]>(`${this.apiUrl}/edificios/genero/${genero}`, { headers: this.getHeaders() });
  }

  modificarEdificio(id: number, datosActualizados: Partial<EdificioDTO>): Observable<EdificioDTO> {
    return this.http.patch<EdificioDTO>(`${this.apiUrl}/edificios/${id}`, datosActualizados, { headers: this.getHeaders() });
  }

  // PISOS

  obtenerTodosLosPisos(): Observable<PisoDTO[]> {
    return this.http.get<PisoDTO[]>(`${this.apiUrl}/pisos`, { headers: this.getHeaders() });
  }

  obtenerPisosPorEdificio(idEdificio: number): Observable<PisoDTO[]> {
    return this.http.get<PisoDTO[]>(`${this.apiUrl}/pisos/edificio/${idEdificio}`, { headers: this.getHeaders() });
  }

  crearPiso(nroPiso: number, nombre: string, idEdificio: number): Observable<PisoDTO> {
    const payload: CrearPisoRequest = { nroPiso, nombre, idEdificio };
    return this.http.post<PisoDTO>(`${this.apiUrl}/pisos`, payload, { headers: this.getHeaders() });
  }

  modificarPiso(id: number, datosActualizados: Partial<PisoDTO>): Observable<PisoDTO> {
    return this.http.patch<PisoDTO>(`${this.apiUrl}/pisos/${id}`, datosActualizados, { headers: this.getHeaders() });
  }

  eliminarPiso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pisos/${id}`, { headers: this.getHeaders() });
  }

  // HABITACIONES

  obtenerTodasLasHabitaciones(): Observable<HabitacionDTO[]> {
    return this.http.get<HabitacionDTO[]>(`${this.apiUrl}/habitaciones`, { headers: this.getHeaders() });
  }

  obtenerTodasLasHabitacionesConDetalles(): Observable<HabitacionDetalleDTO[]> {
    return this.http.get<HabitacionDetalleDTO[]>(`${this.apiUrl}/habitaciones/detalles`, { headers: this.getHeaders() });
  }

  obtenerHabitacionesPorEdificio(idEdificio: number): Observable<HabitacionDTO[]> {
    return this.http.get<HabitacionDTO[]>(`${this.apiUrl}/habitaciones/edificio/${idEdificio}`, { headers: this.getHeaders() });
  }

  crearHabitacion(nroHabitacion: number, capacidadActual: number, disponibilidad: boolean, idPiso: number): Observable<HabitacionDTO> {
    const payload: CrearHabitacionRequest = { nroHabitacion, capacidadActual, disponibilidad, idPiso };
    return this.http.post<HabitacionDTO>(`${this.apiUrl}/habitaciones`, payload, { headers: this.getHeaders() });
  }

  modificarHabitacion(id: number, datosActualizados: Partial<HabitacionDTO>): Observable<HabitacionDTO> {
    return this.http.patch<HabitacionDTO>(`${this.apiUrl}/habitaciones/${id}`, datosActualizados, { headers: this.getHeaders() });
  }

  eliminarHabitacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/habitaciones/${id}`, { headers: this.getHeaders() });
  }
}