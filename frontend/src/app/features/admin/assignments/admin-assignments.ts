import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AsignacionDTO, EstadoAsignacion } from '../../../shared/models';

@Component({
  selector: 'app-admin-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-assignments.html',
  styleUrl: './admin-assignments.scss'
})
export class AdminAssignmentsComponent implements OnInit {
  public EstadoAsignacionEnum = EstadoAsignacion;

  // RUT del administrador simulado
  public readonly RUT_ADMIN_ACTUAL = '14.555.666-7'; 
  public readonly NOMBRE_ADMIN_ACTUAL = 'Cristóbal Administrador';

  asignaciones: AsignacionDTO[] = [
    { 
      id_asignacion: 1,
      fecha_asignacion: '2026-03-15',
      fecha_check_in: null, 
      fecha_check_out: null,
      estado: EstadoAsignacion.ACTIVA,
      id_habitacion: 10, id_periodo: 1, 
      nombre_estudiante: 'Valentina Soto', rut_estudiante: '21.345.678-9',
      nombre_periodo: '2026-1', numero_habitacion: '101', nombre_edificio: 'Residencia Norte',
      rut_admin: null, nombre_admin: undefined
    },
    { 
      id_asignacion: 2,
      fecha_asignacion: '2026-03-10',
      fecha_check_in: '2026-03-25', 
      fecha_check_out: null,
      estado: EstadoAsignacion.ACTIVA,
      id_habitacion: 20, id_periodo: 1, 
      nombre_estudiante: 'Matías Fernández', rut_estudiante: '20.123.456-7',
      nombre_periodo: '2026-1', numero_habitacion: '201', nombre_edificio: 'Pabellón Sur',
      rut_admin: '11.222.333-4', nombre_admin: 'Admin Recepción'
    },
    { 
      id_asignacion: 3,
      fecha_asignacion: '2025-08-01',
      fecha_check_in: '2025-08-15',
      fecha_check_out: '2025-12-20', 
      estado: EstadoAsignacion.FINALIZADA,
      id_habitacion: 12, id_periodo: 2, 
      nombre_estudiante: 'Camila Rojas', rut_estudiante: '19.876.543-2',
      nombre_periodo: '2025-2', numero_habitacion: '103', nombre_edificio: 'Residencia Norte',
      rut_admin: '12.888.777-6', nombre_admin: 'Admin Turno Noche'
    },
    { 
      id_asignacion: 4,
      fecha_asignacion: '2026-04-01',
      fecha_check_in: null,
      fecha_check_out: '2026-04-10', 
      estado: EstadoAsignacion.RENUNCIADA,
      id_habitacion: 11, id_periodo: 1,
      nombre_estudiante: 'Sebastián Morales', rut_estudiante: '22.111.222-3',
      nombre_periodo: '2026-1', numero_habitacion: '102', nombre_edificio: 'Residencia Norte',
      rut_admin: '13.444.555-6', nombre_admin: 'Admin Supervisor'
    }
  ];

  asignacionesFiltradas: AsignacionDTO[] = [];

  // Filtros
  filtroPeriodo: string = '';
  filtroEstado: EstadoAsignacion | '' = '';
  filtroRut: string = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  // Variables de Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 20; 

  // Control del Modal
  isConfirmModalOpen = false;
  accionPendiente: { tipo: 'RENUNCIA', asignacion: AsignacionDTO } | null = null;

  ngOnInit(): void {
    this.asignacionesFiltradas = [...this.asignaciones];
    this.filtroPeriodo = '2026-1';
    this.aplicarFiltros();
  }

  // --- GETTERS DE PAGINACIÓN ---
  get asignacionesPaginadas(): AsignacionDTO[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.asignacionesFiltradas.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.asignacionesFiltradas.length / this.itemsPorPagina) || 1;
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }
  // -----------------------------

  aplicarFiltros(): void {
    const rutBuscado = this.filtroRut.trim().toLowerCase();
    
    this.asignacionesFiltradas = this.asignaciones.filter(asig => {
      const matchPeriodo = this.filtroPeriodo ? asig.nombre_periodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? asig.estado === this.filtroEstado : true;
      const matchRut = rutBuscado ? (asig.rut_estudiante || '').toLowerCase().includes(rutBuscado) : true;
      
      return matchPeriodo && matchEstado && matchRut;
    });

    // Reiniciar paginación al filtrar
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroEstado = '';
    this.filtroRut = '';
    this.aplicarFiltros();
  }

  prepararAccion(tipo: 'RENUNCIA', asignacion: AsignacionDTO): void {
    this.accionPendiente = { tipo, asignacion };
    this.isConfirmModalOpen = true;
  }

  ejecutarAccionPendiente(): void {
    if (!this.accionPendiente) return;
    
    const { tipo, asignacion } = this.accionPendiente;
    const hoy = new Date().toISOString().split('T')[0];

    if (tipo === 'RENUNCIA') {
      asignacion.estado = EstadoAsignacion.RENUNCIADA;
      if (!asignacion.fecha_check_out) {
        asignacion.fecha_check_out = hoy; 
      }
      // Vinculamos al admin
      asignacion.rut_admin = this.RUT_ADMIN_ACTUAL;
      asignacion.nombre_admin = this.NOMBRE_ADMIN_ACTUAL;
    }

    this.cerrarModal();
    this.aplicarFiltros();
  }

  cerrarModal(): void {
    this.isConfirmModalOpen = false;
    this.accionPendiente = null;
  }

  obtenerAccionAdmin(asig: AsignacionDTO): string {
    if (asig.estado === EstadoAsignacion.RENUNCIADA) {
      return 'Renuncia por:';
    }
    if (asig.estado === EstadoAsignacion.FINALIZADA) {
      return 'Check-out por:';
    }
    if (asig.estado === EstadoAsignacion.ACTIVA && asig.fecha_check_in) {
      return 'Check-in por:';
    }
    return 'Asignado por:';
  }
  
  getClassForEstado(estado: string): string {
    switch(estado) {
      case EstadoAsignacion.ACTIVA: return 'act';
      case EstadoAsignacion.FINALIZADA: return 'fin';
      case EstadoAsignacion.RENUNCIADA: return 'ren';
      default: return '';
    }
  }
}