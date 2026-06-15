import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminIncidentsService } from './admin-incidents.service';
import { 
  IncidenciaApiResponse,
  IncidenciaDTO, 
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
  public GravedadEnum = GravedadIncidencia;

  // RUT del administrador simulado
  private readonly RUT_ADMIN_ACTUAL = '14.555.666-7'; 

  incidencias: IncidenciaDTO[] = [];

  incidenciasFiltradas: IncidenciaDTO[] = [];

  // Filtros
  filtroPeriodo: string = '';
  filtroGravedad: GravedadIncidencia | '' = '';
  filtroRut: string = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  // Variables de Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 20;

  // Modal
  isModalOpen = false;
  selectedIncident: IncidenciaDTO | null = null; 

  isCreateModalOpen = false;
  nuevaIncidencia = {
    descripcion: '',
    gravedad: GravedadIncidencia.LEVE,
    idHabitacion: 1,
    rutEstudiante: '',
  };

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
      const matchGravedad = this.filtroGravedad ? inc.gravedad === this.filtroGravedad : true;
      const matchRut = rutBuscado ? inc.rutEstudiante.toLowerCase().includes(rutBuscado) : true;
      
      return matchPeriodo && matchGravedad && matchRut;
    });

    // Reiniciar página al filtrar
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroGravedad = '';
    this.filtroRut = '';
    this.aplicarFiltros();
  }

  openModal(incidencia: IncidenciaDTO): void {
    this.selectedIncident = incidencia;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden'; 
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedIncident = null;
    document.body.style.overflow = 'auto'; 
  }

  openCreateModal(): void {
    this.nuevaIncidencia = {
      descripcion: '',
      gravedad: GravedadIncidencia.LEVE,
      idHabitacion: this.nuevaIncidencia.idHabitacion,
      rutEstudiante: '',
    };
    this.isCreateModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  enviarReporte(): void {
    const descripcion = this.nuevaIncidencia.descripcion.trim();
    const rutEstudiante = this.nuevaIncidencia.rutEstudiante.trim();

    if (descripcion.length < 10) {
      alert('La descripcion debe tener al menos 10 caracteres.');
      return;
    }

    if (!rutEstudiante) {
      alert('Ingresa el RUT del estudiante.');
      return;
    }

    if (this.nuevaIncidencia.idHabitacion < 1) {
      alert('Ingresa un ID de habitacion valido.');
      return;
    }

    this.adminIncidentsService
      .createIncidencia({
        descripcion,
        gravedad: this.nuevaIncidencia.gravedad,
        idHabitacion: this.nuevaIncidencia.idHabitacion,
        rutEstudiante,
        rutAdmin: this.RUT_ADMIN_ACTUAL,
      })
      .subscribe({
        next: () => {
          alert('Reporte creado con exito.');
          this.closeCreateModal();
          this.cargarIncidencias();
        },
        error: () => {
          alert('No se pudo crear el reporte. Revisa backend y datos del formulario.');
        },
      });
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
      idIncidencia: row.idIncidencia,
      descripcion: row.descripcion,
      fecha: row.fecha,
      gravedad: row.gravedad,
      idHabitacion: row.idHabitacion,
      nroHabitacion: row.idHabitacion,
      rutEstudiante: row.rutEstudiante,
      rutAdmin: row.rutAdmin,
      periodo: this.filtroPeriodo || 'Sin periodo',
      nombreEdificio: 'Sin edificio',
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
