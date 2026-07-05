import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AsignacionDTO, EstadoAsignacion } from '../../../shared/models';

import { CheckInOutService } from '../../../core/services/checkInOut.service';

@Component({
  selector: 'app-admin-stay-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-stay-management.html',
  styleUrl: './admin-stay-management.scss'
})
export class AdminStayManagementComponent {
  public EstadoAsignacionEnum = EstadoAsignacion;
  public readonly NOMBRE_ADMIN_ACTUAL = 'Administrador de Turno'; 

  rutBusqueda: string = '';
  resultadoBusqueda: AsignacionDTO | null = null;
  busquedaRealizada: boolean = false;
  isLoading: boolean = false;

  isConfirmModalOpen = false;
  accionPendiente: { tipo: 'CHECKOUT' | 'RENUNCIA', asignacion: AsignacionDTO } | null = null;

  constructor(
    private readonly stayService: CheckInOutService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  buscarEstudiante(): void {
    if (!this.rutBusqueda.trim()) {
      this.limpiarBusqueda();
      return;
    }

    // Eliminamos los puntos pero MANTENEMOS el guion para que coincida con "22222222-2"
    const rutLimpiado = this.rutBusqueda.trim().replace(/\./g, '').toUpperCase();
    this.isLoading = true;
    this.busquedaRealizada = false;
    this.resultadoBusqueda = null;

    this.stayService.buscarResidentePorRut(rutLimpiado)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.busquedaRealizada = true;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {
          if (res && res.tieneAsignacion) {
            this.resultadoBusqueda = res.asignacion;
          } else {
            this.resultadoBusqueda = null;
          }
        },
        error: (err: any) => {
          console.error('Error buscando residente:', err);
          this.resultadoBusqueda = null;
        }
      });
  }

  limpiarBusqueda(): void {
    this.rutBusqueda = '';
    this.resultadoBusqueda = null;
    this.busquedaRealizada = false;
  }

  marcarCheckIn(asignacion: AsignacionDTO): void {
    this.stayService.registrarCheckIn(asignacion.idAsignacion).subscribe({
      next: () => {
        this.buscarEstudiante(); 
      },
      error: (err: any) => {
        console.error('Error registrando check-in:', err);
        alert('Ocurrió un error al registrar el Check-In.');
      }
    });
  }

  prepararAccion(tipo: 'CHECKOUT' | 'RENUNCIA', asignacion: AsignacionDTO): void {
    this.accionPendiente = { tipo, asignacion };
    this.isConfirmModalOpen = true;
  }

  ejecutarAccionPendiente(): void {
    if (!this.accionPendiente) return;
    
    const { tipo, asignacion } = this.accionPendiente;
    const request = tipo === 'CHECKOUT' 
      ? this.stayService.registrarCheckOut(asignacion.idAsignacion)
      : this.stayService.renunciarAsignacion(asignacion.idAsignacion);

    request.subscribe({
      next: () => {
        this.cerrarModal();
        this.limpiarBusqueda(); 
      },
      error: (err: any) => {
        console.error(`Error al procesar ${tipo}:`, err);
        alert('Ocurrió un error al procesar la solicitud.');
        this.cerrarModal();
      }
    });
  }

  cerrarModal(): void {
    this.isConfirmModalOpen = false;
    this.accionPendiente = null;
  }

  obtenerAccionAdminTexto(asig: AsignacionDTO): string {
    if (asig.fechaCheckIn) return 'Check-in por:';
    return 'Asignado por:';
  }
}