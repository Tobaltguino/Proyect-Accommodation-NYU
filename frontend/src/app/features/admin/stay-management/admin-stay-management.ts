import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionDTO, EstadoAsignacion } from '../../../shared/models';
import { AsignacionesService } from '../../../core/services/asignaciones.service';
import { CheckInOutService } from '../../../core/services/checkInOut.service';

@Component({
  selector: 'app-admin-stay-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-stay-management.html',
  styleUrl: './admin-stay-management.scss'
})
export class AdminStayManagementComponent implements OnInit {
  public EstadoAsignacionEnum = EstadoAsignacion;

  private asignacionesService = inject(AsignacionesService);
  private checkInOutService = inject(CheckInOutService);

  // Variables del Administrador simulado
  public readonly RUT_ADMIN_ACTUAL = '14.555.666-7'; 
  public readonly NOMBRE_ADMIN_ACTUAL = 'Cristóbal Administrador';

  asignaciones: AsignacionDTO[] = [];

  rutBusqueda: string = '';
  resultadoBusqueda: AsignacionDTO | null = null;
  busquedaRealizada: boolean = false;

  // Control del Modal
  isConfirmModalOpen = false;
  accionPendiente: { tipo: 'CHECKOUT' | 'RENUNCIA', asignacion: AsignacionDTO } | null = null;

  ngOnInit(): void {
    this.cargarAsignaciones();
  }

  cargarAsignaciones(): void {
    this.asignacionesService.obtenerTodas().subscribe({
      next: (data: AsignacionDTO[]) => {
        this.asignaciones = data;
      },
      error: (err: any) => console.error('Error al cargar asignaciones activas', err)
    });
  }

  buscarEstudiante(): void {
    if (!this.rutBusqueda.trim()) {
      this.limpiarBusqueda();
      return;
    }

    const rutLimpiado = this.rutBusqueda.trim().toLowerCase();

    // Buscamos SOLO asignaciones ACTIVAS que coincidan con el RUT
    const encontrada = this.asignaciones.find(asig => 
      asig.estado === EstadoAsignacion.ACTIVA && 
      (asig.rutEstudiante || '').toLowerCase().includes(rutLimpiado)
    );

    this.resultadoBusqueda = encontrada || null;
    this.busquedaRealizada = true;
  }

  limpiarBusqueda(): void {
    this.rutBusqueda = '';
    this.resultadoBusqueda = null;
    this.busquedaRealizada = false;
  }

  marcarCheckIn(asignacion: AsignacionDTO): void {
    const hoy = new Date().toISOString().split('T')[0];

    this.checkInOutService.registrarCheckIn(asignacion.idAsignacion, hoy).subscribe({
      next: () => {
        asignacion.fechaCheckIn = hoy;
        asignacion.rutAdmin = this.RUT_ADMIN_ACTUAL;
        asignacion.nombreAdmin = this.NOMBRE_ADMIN_ACTUAL;
      },
      error: (err: any) => console.error('Error al registrar check-in', err)
    });
  }

  prepararAccion(tipo: 'CHECKOUT' | 'RENUNCIA', asignacion: AsignacionDTO): void {
    this.accionPendiente = { tipo, asignacion };
    this.isConfirmModalOpen = true;
  }

  ejecutarAccionPendiente(): void {
    if (!this.accionPendiente) return;
    
    const { tipo, asignacion } = this.accionPendiente;
    const hoy = new Date().toISOString().split('T')[0];

    const accion$ = tipo === 'CHECKOUT'
      ? this.asignacionesService.finalizarAsignacion(asignacion.idAsignacion)
      : this.asignacionesService.renunciarAsignacion(asignacion.idAsignacion);

    accion$.subscribe({
      next: () => {
        asignacion.estado = tipo === 'CHECKOUT'
          ? EstadoAsignacion.FINALIZADA
          : EstadoAsignacion.RENUNCIADA;
        asignacion.fechaCheckOut = hoy;
        asignacion.rutAdmin = this.RUT_ADMIN_ACTUAL;
        asignacion.nombreAdmin = this.NOMBRE_ADMIN_ACTUAL;

        this.cerrarModal();
        this.limpiarBusqueda();
        this.cargarAsignaciones();
      },
      error: (err: any) => console.error(`Error al procesar ${tipo}`, err)
    });
  }

  cerrarModal(): void {
    this.isConfirmModalOpen = false;
    this.accionPendiente = null;
  }

  // Utilidad visual
  obtenerAccionAdminTexto(asig: AsignacionDTO): string {
    if (asig.fechaCheckIn) return 'Check-in por:';
    return 'Asignado por:';
  }
}
