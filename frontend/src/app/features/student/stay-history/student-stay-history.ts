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

  // Datos simulados del historial de un estudiante específico
  historial: AsignacionDTO[] = [
    {
      idAsignacion: 1,
      fechaAsignacion: '2026-02-15',
      fechaCheckIn: '2026-03-01',
      fechaCheckOut: null, 
      estado: EstadoAsignacion.ACTIVA,
      idHabitacion: 204,
      numeroHabitacion: '204', 
      idPeriodo: 1,
      nombrePeriodo: '2026-1',
      rutEstudiante: '12.345.678-9',
      nombreEstudiante: 'Estudiante Demo',
      rutAdmin: null, 
      nombreEdificio: 'Residencia Norte'
    },
    {
      idAsignacion: 2,
      fechaAsignacion: '2025-07-20',
      fechaCheckIn: '2025-08-05',
      fechaCheckOut: '2025-12-15',
      estado: EstadoAsignacion.FINALIZADA,
      idHabitacion: 101,
      numeroHabitacion: '101',
      idPeriodo: 2,
      nombrePeriodo: '2025-2',
      rutEstudiante: '12.345.678-9',
      nombreEstudiante: 'Estudiante Demo',
      rutAdmin: '11.222.333-4', 
      nombreEdificio: 'Pabellón Sur'
    },
    {
      idAsignacion: 3,
      fechaAsignacion: '2025-01-10',
      fechaCheckIn: '2025-03-01',
      fechaCheckOut: '2025-05-10',
      estado: EstadoAsignacion.RENUNCIADA,
      idHabitacion: 305,
      numeroHabitacion: '305',
      idPeriodo: 3,
      nombrePeriodo: '2025-1',
      rutEstudiante: '12.345.678-9',
      nombreEstudiante: 'Estudiante Demo',
      rutAdmin: '12.888.777-6', 
      nombreEdificio: 'Residencia Norte'
    }
  ];

  historialFiltrado: AsignacionDTO[] = [];
  asignacionActual: AsignacionDTO | null = null;

  // Filtros
  filtroPeriodo: string = '';
  filtroEstado: EstadoAsignacion | '' = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  // Variables de Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 20;

  ngOnInit(): void {
    this.historialFiltrado = [...this.historial];
    
    // Identificamos la asignación actual para destacarla si existe
    this.asignacionActual = this.historial.find(a => a.estado === EstadoAsignacion.ACTIVA) || null;
    this.aplicarFiltros();
  }

  // Getters de Paginación
  get historialPaginado(): AsignacionDTO[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.historialFiltrado.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.historialFiltrado.length / this.itemsPorPagina) || 1;
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  aplicarFiltros(): void {
    this.historialFiltrado = this.historial.filter(asig => {
      const matchPeriodo = this.filtroPeriodo ? asig.nombrePeriodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? asig.estado === this.filtroEstado : true;
      return matchPeriodo && matchEstado;
    });
    
    // Reiniciar página al filtrar
    this.paginaActual = 1;
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