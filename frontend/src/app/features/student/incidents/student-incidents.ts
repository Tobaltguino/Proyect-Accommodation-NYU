import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';

import { IncidenciaService } from '../../../core/services/incidencia.service';

import { 
  IncidenciaApiResponse,
  IncidenciaDTO, 
  GravedadIncidencia 
} from '../../../shared/models';

@Component({
  selector: 'app-student-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-incidents.html',
  styleUrl: './student-incidents.scss'
})
export class StudentIncidentsComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  // Exponemos los Enums a la vista HTML
  public GravedadEnum = GravedadIncidencia;

  misIncidencias: IncidenciaDTO[] = [];

  incidenciasFiltradas: IncidenciaDTO[] = [];

  // Filtros
  filtroPeriodo: string = '';
  filtroGravedad: GravedadIncidencia | '' = '';
  periodos: string[] = ['2026-1', '2025-2'];

  
  // Variables de Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 20;

  // Variables para Modal de Visualización
  isViewModalOpen = false;
  selectedIncident: IncidenciaDTO | null = null; 

  private userRut = '';

  constructor(
    // 👇 Inyectamos el servicio centralizado
    private readonly incidenciaService: IncidenciaService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.userRut = this.authService.getCurrentUser()?.rut ?? '';
    this.filtroPeriodo = '2026-1';
    void this.cargarIncidencias();
  }

  // Getters de Paginación
  get incidenciasPaginadas(): IncidenciaDTO[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.incidenciasFiltradas.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.incidenciasFiltradas.length / this.itemsPorPagina) || 1;
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  aplicarFiltros(): void {
    this.incidenciasFiltradas = this.misIncidencias.filter(inc => {
      const matchPeriodo = this.filtroPeriodo ? inc.periodo === this.filtroPeriodo : true;
      const matchGravedad = this.filtroGravedad ? inc.gravedad === this.filtroGravedad : true;
      
      return matchPeriodo && matchGravedad;
    });

    // Reiniciar página al filtrar
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroGravedad = '';
    this.aplicarFiltros();
  }

  // --- MÉTODOS MODAL VISUALIZAR ---
  openViewModal(incidencia: IncidenciaDTO): void {
    this.selectedIncident = incidencia;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedIncident = null;
  }

  private async cargarIncidencias(): Promise<void> {
    // 👇 Llamamos al método getIncidencias del servicio centralizado
    this.incidenciaService
      .getIncidencias({
        // Como es la vista del estudiante, le pasamos su RUT para que el backend filtre
        rut: this.userRut || undefined,
      })
      .subscribe({
        next: (rows) => {
          this.misIncidencias = rows.map((row) => this.mapApiToDto(row));
          this.periodos = this.resolvePeriods(this.misIncidencias);
          this.aplicarFiltros();
          this.cdr.detectChanges();
        },
        error: () => {
          this.misIncidencias = [];
          this.incidenciasFiltradas = [];
          this.cdr.detectChanges();
        },
      });
  }

  private mapApiToDto(row: IncidenciaApiResponse): IncidenciaDTO {
    return {
      idIncidencia: row.idIncidencia,
      descripcion: row.descripcion,
      fecha: row.fecha,
      gravedad: row.gravedad,
      idHabitacion: row.idHabitacion,
      nroHabitacion: row.habitacion?.nroHabitacion ?? row.idHabitacion,
      rutEstudiante: row.rutEstudiante,
      rutAdmin: row.rutAdmin,
      periodo: this.filtroPeriodo || 'Sin periodo',
      nombreEdificio: row.habitacion?.piso?.edificio?.nombre ?? 'Sin edificio',
      numeroPiso: row.habitacion?.piso?.nroPiso
    };
  }

  private resolvePeriods(rows: IncidenciaDTO[]): string[] {
    const dynamicPeriods = Array.from(
      new Set(
        rows
          .map((row) => row.periodo)
          .filter((periodo): periodo is string => Boolean(periodo)),
      ),
    );

    return dynamicPeriods.length > 0 ? dynamicPeriods : ['2026-1'];
  }
}