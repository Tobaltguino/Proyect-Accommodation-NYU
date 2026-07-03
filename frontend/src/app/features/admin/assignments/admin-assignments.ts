import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionDTO, EstadoAsignacion } from '../../../shared/models';
import { AsignacionesService } from '../../../core/services/asignaciones.service'; 

@Component({
  selector: 'app-admin-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-assignments.html',
  styleUrl: './admin-assignments.scss'
})
export class AdminAssignmentsComponent implements OnInit {
  public EstadoAsignacionEnum = EstadoAsignacion;

  private asignacionesService = inject(AsignacionesService);
  private cdr = inject(ChangeDetectorRef); 

  asignaciones: AsignacionDTO[] = [];
  asignacionesFiltradas: AsignacionDTO[] = [];

  filtroPeriodo: string = '';
  filtroEstado: EstadoAsignacion | '' = '';
  filtroRut: string = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  paginaActual: number = 1;
  itemsPorPagina: number = 20; 

  isConfirmModalOpen = false;
  accionPendiente: { tipo: 'RENUNCIA', asignacion: AsignacionDTO } | null = null;

  ngOnInit(): void {
    this.filtroPeriodo = ''; 
    this.cargarAsignaciones();
  }

  cargarAsignaciones(): void {
    this.asignacionesService.obtenerTodas().subscribe({
      next: (data: AsignacionDTO[]) => {
        this.asignaciones = data;
        this.aplicarFiltros();
      },
      error: (err: any) => console.error('Error al cargar asignaciones', err)
    });
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

  // FILTROS
  aplicarFiltros(): void {
    const rutBuscado = this.filtroRut.trim().toLowerCase();
    
    this.asignacionesFiltradas = this.asignaciones.filter(asig => {
      const matchPeriodo = this.filtroPeriodo ? asig.nombrePeriodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? asig.estado === this.filtroEstado : true;
      const matchRut = rutBuscado ? (asig.rutEstudiante || '').toLowerCase().includes(rutBuscado) : true;
      
      return matchPeriodo && matchEstado && matchRut;
    });

    this.paginaActual = 1;
    
    this.cdr.detectChanges(); 
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroEstado = '';
    this.filtroRut = '';
    this.aplicarFiltros();
  }

  // RENUNCIA
  prepararAccion(tipo: 'RENUNCIA', asignacion: AsignacionDTO): void {
    this.accionPendiente = { tipo, asignacion };
    this.isConfirmModalOpen = true;
  }

  ejecutarAccionPendiente(): void {
    if (!this.accionPendiente) return;
    
    const { tipo, asignacion } = this.accionPendiente;

    if (tipo === 'RENUNCIA') {
      this.asignacionesService.renunciarAsignacion(asignacion.idAsignacion).subscribe({
        next: () => {
          this.cargarAsignaciones(); 
          this.cerrarModal();
        },
        error: (err: any) => console.error('Error al registrar renuncia', err)
      });
    }
  }

  cerrarModal(): void {
    this.isConfirmModalOpen = false;
    this.accionPendiente = null;
    this.cdr.detectChanges(); 
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