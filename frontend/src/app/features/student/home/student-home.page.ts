import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';
// Importamos tus nuevos modelos
import { DietaDTO, TipoDieta } from '../../../shared/models'; 

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-home.page.html',
  styleUrl: './student-home.page.scss'
})
export class StudentHomePageComponent implements OnInit {
  currentUser: SessionUser | null = null;
  
  tieneAsignacion: boolean = true; 

  miPlanDieta: DietaDTO = {
    idPlan: 1,
    tipoPlan: TipoDieta.VEGANO,
    idPeriodo: 1,
    rutEstudiante: '', 
    nombreEstudiante: '' 
  };

  miAsignacion = {
    edificio: 'Residencia Norte',
    piso: 2,
    habitacion: 204,
    fechaIngreso: '2026-03-01'
  };

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
    
    // Si hay un usuario logueado, le asignamos su RUT al plan de dieta
    if (this.currentUser) {
      // Nota: Asumo que en tu auth.models.ts agregaste el 'rut' al SessionUser.
      // Si la variable se llama diferente, cámbialo aquí.
      this.miPlanDieta.rutEstudiante = (this.currentUser as any).rut || '12.345.678-9';
    }
  }

  ngOnInit(): void {
    // En el futuro, tus llamadas al backend también usarán el RUT:
    // this.estudianteService.getAsignacionPorRut(this.currentUser.rut).subscribe(...)
  }
}