import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HistorialResidenciaDTO, TipoMovimientoHistorial } from '../../../shared/models';
import { HistorialService } from '../../../core/services/historial.service';

@Component({
  selector: 'app-student-stay-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-stay-history.html',
  styleUrl: './student-stay-history.scss'
})
export class StudentStayHistoryComponent implements OnInit {
  private historialService = inject(HistorialService);
  private cdr = inject(ChangeDetectorRef);

  historial: HistorialResidenciaDTO[] = [];
  historialFiltrado: HistorialResidenciaDTO[] = [];

  filtroPeriodo: string = '';
  filtroMovimiento: TipoMovimientoHistorial | '' = '';
  periodos: string[] = [];

  paginaActual: number = 1;
  itemsPorPagina: number = 20;

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.historialService.obtenerMiHistorial().subscribe({
      next: (data: HistorialResidenciaDTO[]) => {
        this.historial = data;
        this.periodos = Array.from(new Set(data.map(item => item.nombrePeriodo).filter(Boolean)));
        this.aplicarFiltros();
      },
      error: (err: any) => console.error('Error al cargar el historial del estudiante', err)
    });
  }

  get historialPaginado(): HistorialResidenciaDTO[] {
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

  // FILTROS
  aplicarFiltros(): void {
    this.historialFiltrado = this.historial.filter(asig => {
      const matchPeriodo = this.filtroPeriodo ? asig.nombrePeriodo === this.filtroPeriodo : true;
      const matchMovimiento = this.filtroMovimiento ? asig.tipoMovimiento === this.filtroMovimiento : true;
      return matchPeriodo && matchMovimiento;
    });
    
    this.paginaActual = 1;
    this.cdr.detectChanges(); 
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroMovimiento = '';
    this.aplicarFiltros();
  }

  getLabelMovimiento(tipo: TipoMovimientoHistorial): string {
    switch (tipo) {
      case 'ASIGNACION': return 'Asignación';
      case 'CHECK_IN': return 'Check-in';
      case 'REASIGNACION': return 'Reasignación';
      case 'CHECK_OUT': return 'Check-out';
      case 'RENUNCIA': return 'Renuncia';
    }
  }

  getClassForMovimiento(tipo: TipoMovimientoHistorial): string {
    switch (tipo) {
      case 'ASIGNACION': return 'act';
      case 'CHECK_IN': return 'act';
      case 'REASIGNACION': return 'ren';
      case 'CHECK_OUT': return 'fin';
      case 'RENUNCIA': return 'ren';
      default: return '';
    }
  }

  getUbicacion(movimiento: HistorialResidenciaDTO): string {
    if (movimiento.tipoMovimiento === 'REASIGNACION') {
      return `${this.formatHabitacion(movimiento.habitacionAnterior)} -> ${this.formatHabitacion(movimiento.habitacionNueva)}`;
    }

    return this.formatHabitacion(movimiento.habitacionNueva ?? movimiento.habitacionAnterior);
  }

  private formatHabitacion(habitacion: HistorialResidenciaDTO['habitacionNueva']): string {
    if (!habitacion) {
      return 'Sin habitación';
    }

    return `${habitacion.nombreEdificio}, Hab. ${habitacion.numeroHabitacion}`;
  }
}
