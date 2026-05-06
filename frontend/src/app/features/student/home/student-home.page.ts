import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';
// 👇 Importamos tus nuevos modelos desde el patrón barril
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
  
  tieneAsignacion: boolean = true; //Para ver si mostramos habitacion o decir que postule

  miPlanDieta: DietaDTO = {
    id_plan: 1,
    tipo_plan: TipoDieta.VEGANO,
    id_periodo: 1,
    id_usuario: 0
  };

  miAsignacion = {
    edificio: 'Residencia Norte',
    piso: 2,
    habitacion: 204,
    fechaIngreso: '2026-03-01'
  };

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
    
    // Si hay un usuario logueado, le asignamos su ID al plan de dieta
    if (this.currentUser) {
      this.miPlanDieta.id_usuario = this.currentUser.id;
    }
  }

  ngOnInit(): void {
    // Aquí en el futuro llamaremos al backend:
    // this.estudianteService.getAsignacion(this.currentUser.id).subscribe(...)
  }
}