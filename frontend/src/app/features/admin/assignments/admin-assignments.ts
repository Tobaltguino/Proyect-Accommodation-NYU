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
      idAsignacion: 1,
      fechaAsignacion: '2026-03-15',
      fechaCheckIn: null, 
      fechaCheckOut: null,
      estado: EstadoAsignacion.ACTIVA,
      idHabitacion: 10, idPeriodo: 1, 
      nombreEstudiante: 'Valentina Soto', rutEstudiante: '21.345.678-9',
      nombrePeriodo: '2026-1', numeroHabitacion: '101', nombreEdificio: 'Residencia Norte',
      rutAdmin: null, nombreAdmin: undefined
    },
    { 
      idAsignacion: 2,
      fechaAsignacion: '2026-03-10',
      fechaCheckIn: '2026-03-25', 
      fechaCheckOut: null,
      estado: EstadoAsignacion.ACTIVA,
      idHabitacion: 20, idPeriodo: 1, 
      nombreEstudiante: 'Matías Fernández', rutEstudiante: '20.123.456-7',
      nombrePeriodo: '2026-1', numeroHabitacion: '201', nombreEdificio: 'Pabellón Sur',
      rutAdmin: '11.222.333-4', nombreAdmin: 'Admin Recepción'
    },
    { 
      idAsignacion: 3,
      fechaAsignacion: '2025-08-01',
      fechaCheckIn: '2025-08-15',
      fechaCheckOut: '2025-12-20', 
      estado: EstadoAsignacion.FINALIZADA,
      idHabitacion: 12, idPeriodo: 2, 
      nombreEstudiante: 'Camila Rojas', rutEstudiante: '19.876.543-2',
      nombrePeriodo: '2025-2', numeroHabitacion: '103', nombreEdificio: 'Residencia Norte',
      rutAdmin: '12.888.777-6', nombreAdmin: 'Admin Turno Noche'
    },
    { 
      idAsignacion: 4,
      fechaAsignacion: '2026-04-01',
      fechaCheckIn: null,
      fechaCheckOut: '2026-04-10', 
      estado: EstadoAsignacion.RENUNCIADA,
      idHabitacion: 11, idPeriodo: 1,
      nombreEstudiante: 'Sebastián Morales', rutEstudiante: '22.111.222-3',
      nombrePeriodo: '2026-1', numeroHabitacion: '102', nombreEdificio: 'Residencia Norte',
      rutAdmin: '13.444.555-6', nombreAdmin: 'Admin Supervisor'
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
      const matchPeriodo = this.filtroPeriodo ? asig.nombrePeriodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? asig.estado === this.filtroEstado : true;
      const matchRut = rutBuscado ? (asig.rutEstudiante || '').toLowerCase().includes(rutBuscado) : true;
      
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
      if (!asignacion.fechaCheckOut) {
        asignacion.fechaCheckOut = hoy; 
      }
      // Vinculamos al admin
      asignacion.rutAdmin = this.RUT_ADMIN_ACTUAL;
      asignacion.nombreAdmin = this.NOMBRE_ADMIN_ACTUAL;
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
    if (asig.estado === EstadoAsignacion.ACTIVA && asig.fechaCheckIn) {
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