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

  // Datos simulados (ya sin id_usuario)
  asignaciones: AsignacionDTO[] = [
    {
      id_asignacion: 1,
      fecha_asignacion: '2026-04-20',
      fecha_check_in: null, 
      fecha_check_out: null,
      estado: EstadoAsignacion.ACTIVA,
      id_habitacion: 10, id_periodo: 1,
      nombre_estudiante: 'Valentina Soto', rut_estudiante: '21.345.678-9',
      nombre_periodo: '2026-1', numero_habitacion: '101', nombre_edificio: 'Residencia Norte',
      rut_admin: null // Aún no llega
    },
    {
      id_asignacion: 2,
      fecha_asignacion: '2026-03-01',
      fecha_check_in: '2026-03-05',
      fecha_check_out: null,
      estado: EstadoAsignacion.ACTIVA,
      id_habitacion: 20, id_periodo: 1,
      nombre_estudiante: 'Matías Fernández', rut_estudiante: '20.123.456-7',
      nombre_periodo: '2026-1', numero_habitacion: '201', nombre_edificio: 'Pabellón Sur',
      rut_admin: '11.222.333-4', nombre_admin: 'Admin Recepción' // Ya hizo check-in con otro admin
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
      (asig.rut_estudiante || '').toLowerCase().includes(rutLimpiado)
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
    asignacion.fecha_check_in = hoy;
    
    // Vinculamos al admin que hace el Check-in
    asignacion.rut_admin = this.RUT_ADMIN_ACTUAL;
    asignacion.nombre_admin = this.NOMBRE_ADMIN_ACTUAL;

    console.log(`Check-In registrado para ${asignacion.nombre_estudiante} el ${hoy} por ${this.NOMBRE_ADMIN_ACTUAL}`);
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
      asignacion.fecha_check_out = hoy;
    } else if (tipo === 'RENUNCIA') {
      asignacion.estado = EstadoAsignacion.RENUNCIADA;
      if (!asignacion.fecha_check_out) {
        asignacion.fecha_check_out = hoy; 
      }
    }

    // Vinculamos al admin que procesa la salida definitiva o renuncia
    asignacion.rut_admin = this.RUT_ADMIN_ACTUAL;
    asignacion.nombre_admin = this.NOMBRE_ADMIN_ACTUAL;

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
    if (asig.fecha_check_in) return 'Check-in por:';
    return 'Asignado por:';
  }
}