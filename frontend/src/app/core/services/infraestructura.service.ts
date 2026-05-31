import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { EdificioDTO, PisoDTO, HabitacionDTO, Genero } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class InfraestructuraService {
  private http = inject(HttpClient);
  
  // URL base de tu backend NestJS
  private apiUrl = 'http://localhost:3000'; 

  // Función auxiliar para armar los headers con el Token JWT
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /* ================== EDIFICIOS*/
  
  // OJO: Esta es la ruta que tu equipo de backend DEBE crear para traer todo el árbol
  obtenerTodaLaInfraestructura(): Observable<EdificioDTO[]> {
    return this.http.get<EdificioDTO[]>(`${this.apiUrl}/residencias/admin/all`, { headers: this.getHeaders() });
  }

  // OJO: Esta también la deben crear para poder editar el nombre/género del edificio
  modificarEdificio(idEdificio: number, datos: Partial<EdificioDTO>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/edificios/${idEdificio}`, datos, { headers: this.getHeaders() });
  }

  /* ============ PISOS */

  crearPiso(nroPiso: number, nombre: string, idEdificio: number): Observable<any> {
    const payload = { nroPiso, nombre, idEdificio }; // Fíjate que usamos camelCase como pide NestJS
    return this.http.post(`${this.apiUrl}/pisos`, payload, { headers: this.getHeaders() });
  }

  modificarPiso(idPiso: number, datos: Partial<PisoDTO>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/pisos/${idPiso}`, datos, { headers: this.getHeaders() });
  }

  eliminarPiso(idPiso: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pisos/${idPiso}`, { headers: this.getHeaders() });
  }

  /* ======== HABITACIONES */

  crearHabitacion(nroHabitacion: number, capacidadActual: number, disponibilidad: boolean, idPiso: number): Observable<any> {
    const payload = { nroHabitacion, capacidadActual, disponibilidad, idPiso };
    return this.http.post(`${this.apiUrl}/habitaciones`, payload, { headers: this.getHeaders() });
  }

  modificarHabitacion(idHabitacion: number, datos: Partial<HabitacionDTO>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/habitaciones/${idHabitacion}`, datos, { headers: this.getHeaders() });
  }

  eliminarHabitacion(idHabitacion: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/habitaciones/${idHabitacion}`, { headers: this.getHeaders() });
  }
}