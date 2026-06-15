import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { AsignacionDTO } from '../../../shared/models';

export type Gender = 'MUJER' | 'HOMBRE';
export type MealPlan = 'Sin preferencia' | 'Vegetariano' | 'Vegano';

export interface RoomAvailability {
  code: string;
  occupiedBeds: number;
  totalBeds: number;
}

export interface FloorAvailability {
  level: number;
  rooms: RoomAvailability[];
}

export interface BuildingAvailability {
  id: 'FEMENINO' | 'MASCULINO';
  label: string;
  gender: Gender;
  floors: FloorAvailability[];
}

export interface AvailabilityResponse {
  semester: string;
  building: BuildingAvailability;
}

export interface CreateSolicitudPayload {
  planAlimenticio: MealPlan;
}

export interface SolicitudResponse {
  id: number;
  idSolicitud?: number;
  rut: string;
  rutEstudiante?: string;
  fullName: string;
  semester: string;
  career: string;
  gender: Gender;
  phone: string;
  city: string;
  mealPlan: MealPlan;
  buildingId: 'FEMENINO' | 'MASCULINO';
  roomCode: string;
  motivation: string;
  status: 'EN_REVISION' | 'APROBADA' | 'RECHAZADA' | 'EXPIRADA' | 'FINALIZADA' | 'En Revision' | 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Finalizada';
  estado?: 'EN_REVISION' | 'APROBADA' | 'RECHAZADA' | 'EXPIRADA' | 'FINALIZADA' | 'En Revision' | 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Finalizada';
  fechaSolicitud?: string;
  idPeriodo?: number;
  idAsignacion?: number | null;
  nombrePeriodo?: string;
  asignacion?: AsignacionDTO | null;
  planAlimenticio?: MealPlan;
  plan_alimenticio?: MealPlan;
  reservationExpiresAt: string | null;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class StudentPostulationService {
  private readonly apiBaseUrl = 'http://localhost:3000';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getAvailability(gender: Gender, semester: string): Observable<AvailabilityResponse> {
    const params = new HttpParams().set('gender', gender).set('semester', semester);

    return this.http.get<AvailabilityResponse>(
      `${this.apiBaseUrl}/residencias/disponibilidad`,
      {
        headers: this.getAuthHeaders(),
        params,
      },
    );
  }

  createSolicitud(payload: CreateSolicitudPayload): Observable<SolicitudResponse> {
    return this.http.post<SolicitudResponse>(`${this.apiBaseUrl}/solicitudes`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  getMySolicitud(semester: string): Observable<SolicitudResponse | null> {
    const params = new HttpParams().set('semester', semester);

    return this.http.get<SolicitudResponse | null>(`${this.apiBaseUrl}/solicitudes/mia`, {
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
