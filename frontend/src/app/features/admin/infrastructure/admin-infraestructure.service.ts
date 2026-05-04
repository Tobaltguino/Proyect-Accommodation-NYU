import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EdificioDTO, PisoDTO, HabitacionDTO } from '../../../shared/models';

@Injectable({
  providedIn: 'root' 
})
export class InfrastructureService {
  
  // Urls de APIs
  private readonly API_EDIFICIOS = 'http://localhost:3000/api/edificios';
  private readonly API_PISOS = 'http://localhost:3000/api/pisos';
  private readonly API_HABITACIONES = 'http://localhost:3000/api/habitaciones';

  constructor(private http: HttpClient) { }

  // --- MÉTODOS PARA EDIFICIOS ---

  getEdificios(): Observable<EdificioDTO[]> {
    return this.http.get<EdificioDTO[]>(this.API_EDIFICIOS);
  }

  crearEdificio(edificio: Partial<EdificioDTO>): Observable<EdificioDTO> {
    return this.http.post<EdificioDTO>(this.API_EDIFICIOS, edificio);
  }

  actualizarEdificio(id: number, edificio: Partial<EdificioDTO>): Observable<EdificioDTO> {
    return this.http.patch<EdificioDTO>(`${this.API_EDIFICIOS}/${id}`, edificio);
  }

  eliminarEdificio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_EDIFICIOS}/${id}`);
  }

  // --- MÉTODOS PARA PISOS ---
  
  crearPiso(idEdificio: number, piso: Partial<PisoDTO>): Observable<PisoDTO> {
    return this.http.post<PisoDTO>(`${this.API_EDIFICIOS}/${idEdificio}/pisos`, piso);
  }

  actualizarPiso(idPiso: number, piso: Partial<PisoDTO>): Observable<PisoDTO> {
    return this.http.patch<PisoDTO>(`${this.API_PISOS}/${idPiso}`, piso);
  }

  eliminarPiso(idPiso: number): Observable<void> {
    return this.http.delete<void>(`${this.API_PISOS}/${idPiso}`);
  }

  // --- MÉTODOS PARA HABITACIONES ---

  crearHabitacion(idPiso: number, habitacion: Partial<HabitacionDTO>): Observable<HabitacionDTO> {
    return this.http.post<HabitacionDTO>(`${this.API_PISOS}/${idPiso}/habitaciones`, habitacion);
  }

  actualizarHabitacion(idHabitacion: number, habitacion: Partial<HabitacionDTO>): Observable<HabitacionDTO> {
    return this.http.patch<HabitacionDTO>(`${this.API_HABITACIONES}/${idHabitacion}`, habitacion);
  }

  eliminarHabitacion(idHabitacion: number): Observable<void> {
    return this.http.delete<void>(`${this.API_HABITACIONES}/${idHabitacion}`);
  }

  cambiarDisponibilidad(idHabitacion: number, disponibilidad: boolean): Observable<HabitacionDTO> {
    return this.http.patch<HabitacionDTO>(`${this.API_HABITACIONES}/${idHabitacion}/disponibilidad`, { 
      disponibilidad: disponibilidad 
    });
  }
}