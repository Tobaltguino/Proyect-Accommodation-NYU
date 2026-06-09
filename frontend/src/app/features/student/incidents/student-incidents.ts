import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { StudentIncidentsService } from './student-incidents.service';
import {
  IncidenciaApiResponse,
  IncidenciaDTO,
  EstadoIncidencia,
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
  // Exponemos los Enums a la vista HTML
  public EstadoEnum = EstadoIncidencia;
  public GravedadEnum = GravedadIncidencia;

  // Simulamos solo las incidencias de ESTE estudiante
  misIncidencias: IncidenciaDTO[] = [
    {
      idIncidencia: 101,
      descripcion: 'Fuga de agua en el lavamanos.',
      estado: EstadoIncidencia.PENDIENTE,
      fecha: '2026-05-02',
      gravedad: GravedadIncidencia.MODERADO,
      idHabitacion: 20,
      nroHabitacion: 204,
      nombreEdificio: 'Residencia Norte',
      rutEstudiante: '12.345.678-9',
      nombreEstudiante: 'Estudiante Demo',
      periodo: '2026-1',
      rutAdmin: null
    },
    {
      idIncidencia: 102,
      descripcion: 'Ampolleta principal quemada.',
      estado: EstadoIncidencia.RESUELTA,
      fecha: '2026-04-15',
      gravedad: GravedadIncidencia.LEVE,
      idHabitacion: 20,
      nroHabitacion: 204,
      nombreEdificio: 'Residencia Norte',
      rutEstudiante: '12.345.678-9',
      nombreEstudiante: 'Estudiante Demo',
      periodo: '2026-1',
      rutAdmin: '11.222.333-4',
      nombreAdmin: 'Admin Mantenimiento'
    }
  ];

  incidenciasFiltradas: IncidenciaDTO[] = [];

  // Filtros
  filtroPeriodo: string = '';
  filtroEstado: EstadoIncidencia | '' = '';
  filtroGravedad: GravedadIncidencia | '' = '';
  periodos: string[] = ['2026-1', '2025-2'];

  // Variables de Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 20;

  // Variables para Modal de Visualización
  isViewModalOpen = false;
  selectedIncident: IncidenciaDTO | null = null;

  // Variables para Modal de Creación
  isCreateModalOpen = false;
  nuevaIncidencia = {
    descripcion: '',
    gravedad: GravedadIncidencia.LEVE,
    id_habitacion: 1,
  };

  private userRut = '';

  constructor(
    private readonly studentIncidentsService: StudentIncidentsService,
    private readonly authService: AuthService,
  ) { }

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
      const matchEstado = this.filtroEstado ? inc.estado === this.filtroEstado : true;
      const matchGravedad = this.filtroGravedad ? inc.gravedad === this.filtroGravedad : true;

      return matchPeriodo && matchEstado && matchGravedad;
    });

    // Reiniciar página al filtrar
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroEstado = '';
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

  // --- MÉTODOS MODAL CREAR ---
  openCreateModal(): void {
    this.nuevaIncidencia = {
      descripcion: '',
      gravedad: GravedadIncidencia.LEVE,
      id_habitacion: this.nuevaIncidencia.id_habitacion,
    };
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  enviarReporte(): void {
    if (!this.nuevaIncidencia.descripcion.trim()) {
      alert('La descripción no puede estar vacía');
      return;
    }

    if (!this.userRut) {
      alert('No se encontro sesion activa para reportar incidencia.');
      return;
    }

    if (this.nuevaIncidencia.id_habitacion < 1) {
      alert('Ingresa un ID de habitacion valido.');
      return;
    }

    this.studentIncidentsService
      .createIncidencia({
        descripcion: this.nuevaIncidencia.descripcion.trim(),
        gravedad: this.nuevaIncidencia.gravedad,
        idHabitacion: this.nuevaIncidencia.id_habitacion,
        rutEstudiante: this.userRut,
      })
      .subscribe({
        next: () => {
          alert('Reporte enviado con exito.');
          this.closeCreateModal();
          void this.cargarIncidencias();
        },
        error: () => {
          alert('No se pudo enviar el reporte. Revisa backend y datos del formulario.');
        },
      });
  }

  private async cargarIncidencias(): Promise<void> {
    this.studentIncidentsService
      .getIncidencias({
        rut: this.userRut || undefined,
      })
      .subscribe({
        next: (rows) => {
          this.misIncidencias = rows.map((row) => this.mapApiToDto(row));
          this.periodos = this.resolvePeriods(this.misIncidencias);
          this.aplicarFiltros();
        },
        error: () => {
          this.misIncidencias = [];
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
