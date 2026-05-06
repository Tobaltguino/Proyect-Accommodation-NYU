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

  asignaciones: AsignacionDTO[] = [
    {
      id_asignacion: 1,
      fecha_asignacion: '2026-03-15',
      fecha_check_in: null, 
      fecha_check_out: null,
      estado: EstadoAsignacion.ACTIVA,
      id_habitacion: 10, id_periodo: 1, id_usuario: 50,
      nombre_estudiante: 'Valentina Soto', rut_estudiante: '21.345.678-9',
      nombre_periodo: '2026-1', numero_habitacion: '101', nombre_edificio: 'Residencia Norte'
    },
    {
      id_asignacion: 2,
      fecha_asignacion: '2026-03-10',
      fecha_check_in: '2026-03-25', 
      fecha_check_out: null,
      estado: EstadoAsignacion.ACTIVA,
      id_habitacion: 20, id_periodo: 1, id_usuario: 51,
      nombre_estudiante: 'Matías Fernández', rut_estudiante: '20.123.456-7',
      nombre_periodo: '2026-1', numero_habitacion: '201', nombre_edificio: 'Pabellón Sur'
    },
    {
      id_asignacion: 3,
      fecha_asignacion: '2025-08-01',
      fecha_check_in: '2025-08-15',
      fecha_check_out: '2025-12-20', 
      estado: EstadoAsignacion.FINALIZADA,
      id_habitacion: 12, id_periodo: 2, id_usuario: 52,
      nombre_estudiante: 'Camila Rojas', rut_estudiante: '19.876.543-2',
      nombre_periodo: '2025-2', numero_habitacion: '103', nombre_edificio: 'Residencia Norte'
    },
    {
      id_asignacion: 4,
      fecha_asignacion: '2026-04-01',
      fecha_check_in: null,
      fecha_check_out: '2026-04-10', 
      estado: EstadoAsignacion.RENUNCIADA,
      id_habitacion: 11, id_periodo: 1, id_usuario: 53,
      nombre_estudiante: 'Sebastián Morales', rut_estudiante: '22.111.222-3',
      nombre_periodo: '2026-1', numero_habitacion: '102', nombre_edificio: 'Residencia Norte'
    }
  ];

  asignacionesFiltradas: AsignacionDTO[] = [];

  filtroPeriodo: string = '';
  filtroEstado: EstadoAsignacion | '' = '';
  filtroBusqueda: string = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  isConfirmModalOpen = false;
  accionPendiente: { tipo: 'CHECKOUT' | 'RENUNCIA', asignacion: AsignacionDTO } | null = null;

  ngOnInit(): void {
    this.asignacionesFiltradas = [...this.asignaciones];
    this.filtroPeriodo = '2026-1';
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const busqueda = this.filtroBusqueda.toLowerCase();
    
    this.asignacionesFiltradas = this.asignaciones.filter(asig => {
      const matchPeriodo = this.filtroPeriodo ? asig.nombre_periodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? asig.estado === this.filtroEstado : true;
      
      const matchBusqueda = busqueda ? 
        ((asig.nombre_estudiante || '').toLowerCase().includes(busqueda) || 
         (asig.rut_estudiante || '').toLowerCase().includes(busqueda) ||
         (asig.numero_habitacion || '').toString().includes(busqueda)) : true;
      
      return matchPeriodo && matchEstado && matchBusqueda;
    });
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroEstado = '';
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  marcarCheckIn(asignacion: AsignacionDTO): void {
    const hoy = new Date().toISOString().split('T')[0];
    asignacion.fecha_check_in = hoy;
    // 👇 Protegemos el console.log también
    console.log(`Check-In registrado para ${asignacion.nombre_estudiante || 'el estudiante'} el ${hoy}`);
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
      console.log(`Check-Out (Finalización) registrado para ${asignacion.nombre_estudiante || 'el estudiante'}`);
    } else if (tipo === 'RENUNCIA') {
      asignacion.estado = EstadoAsignacion.RENUNCIADA;
      if (!asignacion.fecha_check_out) {
        asignacion.fecha_check_out = hoy; 
      }
      console.log(`Renuncia registrada para ${asignacion.nombre_estudiante || 'el estudiante'}`);
    }

    this.cerrarModal();
    this.aplicarFiltros();
  }

  cerrarModal(): void {
    this.isConfirmModalOpen = false;
    this.accionPendiente = null;
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