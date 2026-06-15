import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HistorialAdminFilters, HistorialService } from '../../../core/services/historial.service';
import { HistorialResidenciaDTO, TipoMovimientoHistorial } from '../../../shared/models';

@Component({
  selector: 'app-admin-residence-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-residence-history.html',
  styleUrl: './admin-residence-history.scss',
})
export class AdminResidenceHistoryComponent implements OnInit {
  private readonly historialService = inject(HistorialService);
  private readonly cdr = inject(ChangeDetectorRef);

  historial: HistorialResidenciaDTO[] = [];
  isLoading = false;
  loadError = '';

  filtroRut = '';
  filtroMovimiento: TipoMovimientoHistorial | '' = '';
  fechaDesde = '';
  fechaHasta = '';

  paginaActual = 1;
  itemsPorPagina = 20;

  readonly movimientos: TipoMovimientoHistorial[] = [
    'ASIGNACION',
    'CHECK_IN',
    'REASIGNACION',
    'CHECK_OUT',
    'RENUNCIA',
  ];

  ngOnInit(): void {
    this.cargarHistorial();
  }

  get historialPaginado(): HistorialResidenciaDTO[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.historial.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.historial.length / this.itemsPorPagina) || 1;
  }

  cargarHistorial(): void {
    this.isLoading = true;
    this.loadError = '';

    this.historialService.obtenerHistorialAdmin(this.buildFilters()).subscribe({
      next: (data) => {
        this.historial = data;
        this.paginaActual = 1;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.historial = [];
        this.loadError = 'No se pudo cargar el historial de residencia.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  limpiarFiltros(): void {
    this.filtroRut = '';
    this.filtroMovimiento = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.cargarHistorial();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  getLabelMovimiento(tipo: TipoMovimientoHistorial): string {
    switch (tipo) {
      case 'ASIGNACION': return 'Asignacion';
      case 'CHECK_IN': return 'Check-in';
      case 'REASIGNACION': return 'Reasignacion';
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

  formatTimestamp(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  private buildFilters(): HistorialAdminFilters {
    return {
      rutEstudiante: this.filtroRut,
      tipoMovimiento: this.filtroMovimiento,
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
    };
  }

  private formatHabitacion(habitacion: HistorialResidenciaDTO['habitacionNueva']): string {
    if (!habitacion) {
      return 'Sin habitacion';
    }

    return `${habitacion.nombreEdificio}, Hab. ${habitacion.numeroHabitacion}`;
  }
}
