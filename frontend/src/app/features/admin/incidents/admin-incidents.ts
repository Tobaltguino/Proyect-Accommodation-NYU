import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminIncidentsService } from './admin-incidents.service';
import { 
  IncidenciaApiResponse,
  IncidenciaDTO, 
  EstadoIncidencia, 
  GravedadIncidencia 
} from '../../../shared/models';

@Component({
  selector: 'app-admin-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-incidents.html',
  styleUrl: './admin-incidents.scss'
})
export class AdminIncidentsComponent implements OnInit {
  public EstadoEnum = EstadoIncidencia;
  public GravedadEnum = GravedadIncidencia;

  // RUT del administrador simulado
  private readonly RUT_ADMIN_ACTUAL = '14.555.666-7'; 
  private readonly NOMBRE_ADMIN_ACTUAL = 'Cristóbal Administrador';

  incidencias: IncidenciaDTO[] = [];

  incidenciasFiltradas: IncidenciaDTO[] = [];

  // Filtros
  filtroPeriodo: string = '';
  filtroEstado: EstadoIncidencia | '' = '';
  filtroGravedad: GravedadIncidencia | '' = '';
  filtroRut: string = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  // Variables de Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 20;

  // Modal
  isModalOpen = false;
  selectedIncident: IncidenciaDTO | null = null; 

  constructor(private readonly adminIncidentsService: AdminIncidentsService) {}

  ngOnInit(): void {
    this.filtroPeriodo = '2026-1';
    this.cargarIncidencias();
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
    const rutBuscado = this.filtroRut.trim().toLowerCase();

    this.incidenciasFiltradas = this.incidencias.filter(inc => {
      const matchPeriodo = this.filtroPeriodo ? inc.periodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? inc.estado === this.filtroEstado : true;
      const matchGravedad = this.filtroGravedad ? inc.gravedad === this.filtroGravedad : true;
      const matchRut = rutBuscado ? inc.rut_estudiante.toLowerCase().includes(rutBuscado) : true;
      
      return matchPeriodo && matchEstado && matchGravedad && matchRut;
    });

    // Reiniciar página al filtrar
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroEstado = '';
    this.filtroGravedad = '';
    this.filtroRut = '';
    this.aplicarFiltros();
  }

  openModal(incidencia: IncidenciaDTO): void {
    this.selectedIncident = incidencia;
    
    // Si está PENDIENTE y el admin la abre, asume la responsabilidad (pasa a EN_PROCESO)
    if (this.selectedIncident.estado === EstadoIncidencia.PENDIENTE) {
      this.selectedIncident.estado = EstadoIncidencia.EN_PROCESO;
      this.selectedIncident.rut_admin = this.RUT_ADMIN_ACTUAL;
      this.selectedIncident.nombre_admin = this.NOMBRE_ADMIN_ACTUAL;
      this.aplicarFiltros(); 
    }

    this.isModalOpen = true;
    document.body.style.overflow = 'hidden'; 
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedIncident = null;
    document.body.style.overflow = 'auto'; 
  }

  marcarComoResuelta(): void {
    if (this.selectedIncident) {
      this.selectedIncident.estado = EstadoIncidencia.RESUELTA;
      
      this.selectedIncident.rut_admin = this.RUT_ADMIN_ACTUAL;
      this.selectedIncident.nombre_admin = this.NOMBRE_ADMIN_ACTUAL;

      this.aplicarFiltros();
      this.closeModal();
      console.log(`Incidencia ${this.selectedIncident.id_incidencia} resuelta por ${this.NOMBRE_ADMIN_ACTUAL}`);
    }
  }

  private cargarIncidencias(): void {
    this.adminIncidentsService.getIncidencias().subscribe({
      next: (rows) => {
        this.incidencias = rows.map((row) => this.mapApiToDto(row));
        this.periodos = this.resolvePeriods(this.incidencias);
        this.aplicarFiltros();
      },
      error: () => {
        this.incidencias = [];
        this.incidenciasFiltradas = [];
      },
    });
  }

  private mapApiToDto(row: IncidenciaApiResponse): IncidenciaDTO {
    return {
      id_incidencia: row.idIncidencia,
      descripcion: row.descripcion,
      estado: row.estado,
      fecha: row.fecha,
      gravedad: row.gravedad,
      id_habitacion: row.idHabitacion,
      nro_habitacion: row.idHabitacion,
      rut_estudiante: row.rutEstudiante,
      rut_admin: row.rutAdmin,
      periodo: this.filtroPeriodo || 'Sin periodo',
      nombre_edificio: 'Sin edificio',
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
