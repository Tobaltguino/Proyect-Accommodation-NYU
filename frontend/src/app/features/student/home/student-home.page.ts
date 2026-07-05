import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';
import { AsignacionesService } from '../../../core/services/asignaciones.service';
import { MiAsignacionResponse, AsignacionDTO, EstadoPago } from '../../../shared/models';

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-home.page.html',
  styleUrl: './student-home.page.scss'
})
export class StudentHomePageComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  
  currentUser: SessionUser | null = null;
  
  isLoading: boolean = true;
  tieneAsignacion: boolean = false; 
  miAsignacion: AsignacionDTO | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly asignacionesService: AsignacionesService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.cargarMiAsignacion();
  }

  cargarMiAsignacion(): void {
    this.isLoading = true;
    
    this.asignacionesService.obtenerMiAsignacion()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response: MiAsignacionResponse) => {
          if (response && response.tieneAsignacion && response.asignacion) {
            this.tieneAsignacion = true;
            
            // 👇 ASIGNACIÓN DIRECTA. Cero mapeo manual.
            this.miAsignacion = response.asignacion; 
            
          } else {
            this.tieneAsignacion = false;
            this.miAsignacion = null;
          }
        },
        error: (err) => {
          console.error('Error al cargar la asignación del estudiante:', err);
          this.tieneAsignacion = false;
          this.miAsignacion = null;
        }
      });
  }

  get diasRestantesPago(): number {
    if (!this.miAsignacion || !this.miAsignacion.fechaAsignacion) return 0;

    const fechaAsig = new Date(this.miAsignacion.fechaAsignacion);
    
    // Sumamos los 15 días reglamentarios de plazo para el arancel
    const fechaLimite = new Date(fechaAsig);
    fechaLimite.setDate(fechaLimite.getDate() + 15);

    const hoy = new Date();
    
    // Calculamos la diferencia de tiempo neta para determinar el estado de vigencia
    const diferenciaMs = fechaLimite.getTime() - hoy.getTime();
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    return dias;
  }

  pagarAsignacion(): void {
    if (this.miAsignacion) {
      const hoy = new Date();
      this.miAsignacion.fechaPago = hoy.toISOString().split('T')[0];
      this.miAsignacion.estadoPago = EstadoPago.PAGADO;
      this.cdr.detectChanges();
    }
  }
}