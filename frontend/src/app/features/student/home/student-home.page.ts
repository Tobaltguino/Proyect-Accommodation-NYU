import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';
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

  // 👇 Agregamos 'fechaAsignacion' al mock para tener un punto de partida
  miAsignacion: any = {
    edificio: 'Residencia Norte',
    piso: 2,
    habitacion: 204,
    fechaIngreso: '2026-03-01',
    fechaAsignacion: '2026-06-25', // Fecha en que se le otorgó la habitación
    fechaPago: null
  };

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      this.miPlanDieta.rutEstudiante = (this.currentUser as any).rut || '12.345.678-9';
    }
  }

  ngOnInit(): void {
    // Aquí irían tus llamadas HTTP reales
  }

  // 👇 NUEVO: Calculamos dinámicamente los días restantes
  get diasRestantesPago(): number {
    const fechaAsig = new Date(this.miAsignacion.fechaAsignacion);
    
    // Le sumamos los 15 días de plazo
    const fechaLimite = new Date(fechaAsig);
    fechaLimite.setDate(fechaLimite.getDate() + 15);

    const hoy = new Date();
    
    // Calculamos la diferencia en milisegundos y la pasamos a días
    const diferenciaMs = fechaLimite.getTime() - hoy.getTime();
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    return dias;
  }

  
  pagarAsignacion(): void {
    const hoy = new Date();
    this.miAsignacion.fechaPago = hoy.toISOString().split('T')[0];
  }
}