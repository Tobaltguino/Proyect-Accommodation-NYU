import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EdificioDTO, PisoDTO, HabitacionDTO } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class InfraestructuraService {
  private http = inject(HttpClient);
  
  // URL base de tu backend NestJS
  private apiUrl = 'http://localhost:3000'; 

  // Funcion auxiliar para inyectar el token en cada peticion
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /* =========================================
      EDIFICIOS (EdificiosController)
  ========================================= */

  // Ideal para la vista de Administrador (Trae todos sin discriminar)
  obtenerTodosLosEdificios(): Observable<EdificioDTO[]> {
    return this.http.get<EdificioDTO[]>(`${this.apiUrl}/edificios`, { headers: this.getHeaders() });
  }

  // Ideal para la vista de Estudiante (Filtra por genero)
  obtenerEdificiosPorGenero(genero: string): Observable<EdificioDTO[]> {
    return this.http.get<EdificioDTO[]>(`${this.apiUrl}/edificios/genero/${genero}`, { headers: this.getHeaders() });
  }

  modificarEdificio(id: number, datosActualizados: Partial<EdificioDTO>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/edificios/${id}`, datosActualizados, { headers: this.getHeaders() });
  }

  /* =========================================
      PISOS (PisosController)
  ========================================= */

  crearPiso(nroPiso: number, nombre: string, idEdificio: number): Observable<any> {
    const payload = { nroPiso, nombre, idEdificio };
    return this.http.post(`${this.apiUrl}/pisos`, payload, { headers: this.getHeaders() });
  }

  modificarPiso(id: number, datosActualizados: Partial<PisoDTO>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/pisos/${id}`, datosActualizados, { headers: this.getHeaders() });
  }

  eliminarPiso(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pisos/${id}`, { headers: this.getHeaders() });
  }

  /* =========================================
      HABITACIONES (HabitacionesController)
  ========================================= */

  crearHabitacion(nroHabitacion: number, capacidadActual: number, disponibilidad: boolean, idPiso: number): Observable<any> {
    const payload = { 
      nroHabitacion, 
      capacidadActual, 
      capacidadTotal: 4, // Simulado temporalmente a 4 como pediste
      disponibilidad, 
      idPiso 
    };
    return this.http.post(`${this.apiUrl}/habitaciones`, payload, { headers: this.getHeaders() });
  }

  modificarHabitacion(id: number, datosActualizados: Partial<HabitacionDTO>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/habitaciones/${id}`, datosActualizados, { headers: this.getHeaders() });
  }

  eliminarHabitacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/habitaciones/${id}`, { headers: this.getHeaders() });
  }

  // Si necesitas listar todas las habitaciones de un edificio en particular
  obtenerHabitacionesPorEdificio(idEdificio: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/habitaciones/edificio/${idEdificio}`, { headers: this.getHeaders() });
  }
}