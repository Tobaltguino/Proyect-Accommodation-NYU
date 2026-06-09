import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionDTO, EstadoAsignacion } from '../../../shared/models';

@Component({
  selector: 'app-admin-stay-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-stay-management.html',
  styleUrl: './admin-stay-management.scss'
})
export class AdminStayManagementComponent implements OnInit {
  public EstadoAsignacionEnum = EstadoAsignacion;

  // Variables del Administrador simulado
  public readonly RUT_ADMIN_ACTUAL = '14.555.666-7'; 
  public readonly NOMBRE_ADMIN_ACTUAL = 'Cristóbal Administrador';

  // Datos simulados
  asignaciones: AsignacionDTO[] = [
    {
      idAsignacion: 1,
      fechaAsignacion: '2026-04-20',
      fechaCheckIn: null, 
      fechaCheckOut: null,
      estado: EstadoAsignacion.ACTIVA,
      idHabitacion: 10, idPeriodo: 1,
      nombreEstudiante: 'Valentina Soto', rutEstudiante: '21.345.678-9',
      nombrePeriodo: '2026-1', numeroHabitacion: '101', nombreEdificio: 'Residencia Norte',
      rutAdmin: null 
    },
    {
      idAsignacion: 2,
      fechaAsignacion: '2026-03-01',
      fechaCheckIn: '2026-03-05',
      fechaCheckOut: null,
      estado: EstadoAsignacion.ACTIVA,
      idHabitacion: 20, idPeriodo: 1,
      nombreEstudiante: 'Matías Fernández', rutEstudiante: '20.123.456-7',
      nombrePeriodo: '2026-1', numeroHabitacion: '201', nombreEdificio: 'Pabellón Sur',
      rutAdmin: '11.222.333-4', nombreAdmin: 'Admin Recepción' 
    }
  ];

  rutBusqueda: string = '';
  resultadoBusqueda: AsignacionDTO | null = null;
  busquedaRealizada: boolean = false;

  // Control del Modal
  isConfirmModalOpen = false;
  accionPendiente: { tipo: 'CHECKOUT' | 'RENUNCIA', asignacion: AsignacionDTO } | null = null;

  ngOnInit(): void {
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
    asignacion.fechaCheckIn = hoy;
    
    // Vinculamos al admin que hace el Check-in
    asignacion.rutAdmin = this.RUT_ADMIN_ACTUAL;
    asignacion.nombreAdmin = this.NOMBRE_ADMIN_ACTUAL;

    console.log(`Check-In registrado para ${asignacion.nombreEstudiante} el ${hoy} por ${this.NOMBRE_ADMIN_ACTUAL}`);
  }

  prepararAccion(tipo: 'CHECKOUT' | 'RENUNCIA', asignacion: AsignacionDTO): void {
    this.accionPendiente = { tipo, asignacion };
    this.isConfirmModalOpen = true;
  }

  ejecutarAccionPendiente(): void {
    if (!this.accionPendiente) return;
    
    const { tipo, asignacion } = this.accionPendiente;
    const hoy = new Date().toISOString().split('T')[0];

    if (tipo === 'CHECKOUT') {
      asignacion.estado = EstadoAsignacion.FINALIZADA;
      asignacion.fechaCheckOut = hoy;
    } else if (tipo === 'RENUNCIA') {
      asignacion.estado = EstadoAsignacion.RENUNCIADA;
      if (!asignacion.fechaCheckOut) {
        asignacion.fechaCheckOut = hoy; 
      }
    }

    // Vinculamos al admin que procesa la salida definitiva o renuncia
    asignacion.rutAdmin = this.RUT_ADMIN_ACTUAL;
    asignacion.nombreAdmin = this.NOMBRE_ADMIN_ACTUAL;

    console.log(`${tipo} registrado por ${this.NOMBRE_ADMIN_ACTUAL}`);

    this.cerrarModal();
    this.limpiarBusqueda(); 
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