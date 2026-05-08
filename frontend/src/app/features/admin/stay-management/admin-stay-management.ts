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

  // Datos simulados (como si vinieran de la BD)
  asignaciones: AsignacionDTO[] = [
    {
      id_asignacion: 1,
      fecha_asignacion: '2026-04-20',
      fecha_check_in: null, 
      fecha_check_out: null,
      estado: EstadoAsignacion.ACTIVA,
      id_habitacion: 10, id_periodo: 1, id_usuario: 50,
      nombre_estudiante: 'Valentina Soto', rut_estudiante: '21.345.678-9',
      nombre_periodo: '2026-1', numero_habitacion: '101', nombre_edificio: 'Residencia Norte'
    },
    {
      id_asignacion: 2,
      fecha_asignacion: '2026-03-01',
      fecha_check_in: '2026-03-05',
      fecha_check_out: null,
      estado: EstadoAsignacion.ACTIVA,
      id_habitacion: 20, id_periodo: 1, id_usuario: 51,
      nombre_estudiante: 'Matías Fernández', rut_estudiante: '20.123.456-7',
      nombre_periodo: '2026-1', numero_habitacion: '201', nombre_edificio: 'Pabellón Sur'
    }
  ];

  rutBusqueda: string = '';
  resultadoBusqueda: AsignacionDTO | null = null;
  busquedaRealizada: boolean = false;

  // Control del Modal
  isConfirmModalOpen = false;
  accionPendiente: { tipo: 'CHECKOUT' | 'RENUNCIA', asignacion: AsignacionDTO } | null = null;

  ngOnInit(): void {
    // Inicializamos vacío
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
    console.log(`Check-In registrado para ${asignacion.nombre_estudiante} el ${hoy}`);
    // Aquí llamarías a tu servicio para guardar en BD
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

    this.cerrarModal();
    // Limpiamos la pantalla después de procesar para recibir al siguiente alumno
    this.limpiarBusqueda(); 
  }

  cerrarModal(): void {
    this.isConfirmModalOpen = false;
    this.accionPendiente = null;
  }
}