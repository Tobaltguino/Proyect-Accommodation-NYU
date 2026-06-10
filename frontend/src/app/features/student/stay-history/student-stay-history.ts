import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AsignacionDTO, EstadoAsignacion } from '../../../shared/models';
import { AsignacionesService } from '../../../core/services/asignaciones.service'; 

@Component({
  selector: 'app-student-stay-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-stay-history.html',
  styleUrl: './student-stay-history.scss'
})
export class StudentStayHistoryComponent implements OnInit {
  public EstadoAsignacionEnum = EstadoAsignacion;

  private asignacionesService = inject(AsignacionesService);
  private cdr = inject(ChangeDetectorRef); 

  historial: AsignacionDTO[] = [];
  historialFiltrado: AsignacionDTO[] = [];
  asignacionActual: AsignacionDTO | null = null;

  filtroPeriodo: string = '';
  filtroEstado: EstadoAsignacion | '' = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  paginaActual: number = 1;
  itemsPorPagina: number = 20;

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    // 👇 Cambiamos para usar el nuevo endpoint
    this.asignacionesService.obtenerMiHistorial().subscribe({
      next: (data: AsignacionDTO[]) => {
        this.historial = data;
        
        // Buscamos si tiene alguna asignación activa para destacarla visualmente
        this.asignacionActual = this.historial.find(a => a.estado === EstadoAsignacion.ACTIVA) || null;
        
        this.aplicarFiltros();
      },
      error: (err: any) => console.error('Error al cargar el historial del estudiante', err)
    });
  }

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

  // FILTROS
  aplicarFiltros(): void {
    this.historialFiltrado = this.historial.filter(asig => {
      const matchPeriodo = this.filtroPeriodo ? asig.nombrePeriodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? asig.estado === this.filtroEstado : true;
      return matchPeriodo && matchEstado;
    });
    
    this.paginaActual = 1;
    this.cdr.detectChanges(); 
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  getClassForEstado(estado: string): string {
    switch (estado) {
      case EstadoAsignacion.ACTIVA: return 'act';
      case EstadoAsignacion.FINALIZADA: return 'fin';
      case EstadoAsignacion.RENUNCIADA: return 'ren';
      default: return '';
    }
  }
}