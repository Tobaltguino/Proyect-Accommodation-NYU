import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionDTO, EstadoAsignacion } from '../../../shared/models';

@Component({
  selector: 'app-student-stay-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-stay-history.html',
  styleUrl: './student-stay-history.scss'
})
export class StudentStayHistoryComponent implements OnInit {
  public EstadoAsignacionEnum = EstadoAsignacion;

  // Datos simulados (mocks) del historial de un estudiante específico
  historial: AsignacionDTO[] = [
    {
      id_asignacion: 1,
      fecha_asignacion: '2026-02-15',
      fecha_check_in: '2026-03-01',
      fecha_check_out: null, 
      estado: EstadoAsignacion.ACTIVA,
      id_habitacion: 204,
      numero_habitacion: '204', 
      id_periodo: 1,
      nombre_periodo: '2026-1',
      rut_estudiante: '12.345.678-9',
      nombre_estudiante: 'Estudiante Demo',
      rut_admin: null, // Agregado para cumplir con la interfaz
      nombre_edificio: 'Residencia Norte'
    },
    {
      id_asignacion: 2,
      fecha_asignacion: '2025-07-20',
      fecha_check_in: '2025-08-05',
      fecha_check_out: '2025-12-15',
      estado: EstadoAsignacion.FINALIZADA,
      id_habitacion: 101,
      numero_habitacion: '101',
      id_periodo: 2,
      nombre_periodo: '2025-2',
      rut_estudiante: '12.345.678-9',
      nombre_estudiante: 'Estudiante Demo',
      rut_admin: '11.222.333-4', // Agregado para cumplir con la interfaz
      nombre_edificio: 'Pabellón Sur'
    },
    {
      id_asignacion: 3,
      fecha_asignacion: '2025-01-10',
      fecha_check_in: '2025-03-01',
      fecha_check_out: '2025-05-10',
      estado: EstadoAsignacion.RENUNCIADA,
      id_habitacion: 305,
      numero_habitacion: '305',
      id_periodo: 3,
      nombre_periodo: '2025-1',
      rut_estudiante: '12.345.678-9',
      nombre_estudiante: 'Estudiante Demo',
      rut_admin: '12.888.777-6', // Agregado para cumplir con la interfaz
      nombre_edificio: 'Residencia Norte'
    }
  ];

  historialFiltrado: AsignacionDTO[] = [];
  asignacionActual: AsignacionDTO | null = null;

  // Filtros
  filtroPeriodo: string = '';
  filtroEstado: EstadoAsignacion | '' = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  ngOnInit(): void {
    this.historialFiltrado = [...this.historial];
    
    // Identificamos la asignación actual para destacarla si existe
    this.asignacionActual = this.historial.find(a => a.estado === EstadoAsignacion.ACTIVA) || null;
  }

  aplicarFiltros(): void {
    this.historialFiltrado = this.historial.filter(asig => {
      const matchPeriodo = this.filtroPeriodo ? asig.nombre_periodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? asig.estado === this.filtroEstado : true;
      return matchPeriodo && matchEstado;
    });
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  getClassForEstado(estado: EstadoAsignacion): string {
    switch (estado) {
      case EstadoAsignacion.ACTIVA: return 'act';
      case EstadoAsignacion.FINALIZADA: return 'fin';
      case EstadoAsignacion.RENUNCIADA: return 'ren';
      default: return '';
    }
  }
}