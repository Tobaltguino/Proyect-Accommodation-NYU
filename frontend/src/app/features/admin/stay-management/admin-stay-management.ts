import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AsignacionDTO, EstadoAsignacion } from '../../../shared/models';
import { CheckInOutService } from '../../../core/services/checkInOut.service';
import { ToastService } from '../../../core/toast/toast.service';

import { RutFormatDirective } from '../../../shared/directives/rut-format.directive';

@Component({
  selector: 'app-admin-stay-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RutFormatDirective],
  templateUrl: './admin-stay-management.html',
  styleUrl: './admin-stay-management.scss'
})
export class AdminStayManagementComponent {
  public EstadoAsignacionEnum = EstadoAsignacion;
  public readonly NOMBRE_ADMIN_ACTUAL = 'Administrador de Turno'; 

  private toastService = inject(ToastService); 

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
      this.toastService.mostrarToast('Debes ingresar un RUT para realizar la búsqueda.', 'danger');
      this.limpiarBusqueda();
      return;
    }

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
          this.toastService.mostrarToast('Error al conectar con el servidor durante la búsqueda.', 'danger'); 
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
        this.toastService.mostrarToast('Check-In registrado con éxito.', 'success'); 
        this.buscarEstudiante(); 
      },
      error: (err: any) => {
        console.error('Error registrando check-in:', err);
        this.toastService.mostrarToast('Ocurrió un error al registrar el Check-In.', 'danger'); 
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
        const mensaje = tipo === 'CHECKOUT' ? 'Check-Out procesado con éxito.' : 'Renuncia registrada con éxito.';
        this.toastService.mostrarToast(mensaje, 'success');
        
        this.cerrarModal();
        this.limpiarBusqueda(); 
      },
      error: (err: any) => {
        console.error(`Error al procesar ${tipo}:`, err);
        this.toastService.mostrarToast(`Ocurrió un error al procesar ${tipo === 'CHECKOUT' ? 'el Check-Out' : 'la renuncia'}.`, 'danger'); 
        this.cerrarModal();
      }
    });
  }

  cerrarModal(): void {
    this.isConfirmModalOpen = false;
    this.accionPendiente = null;
  }
}