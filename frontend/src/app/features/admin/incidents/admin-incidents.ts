import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { AsignacionesService } from '../../../core/services/asignaciones.service';
import { IncidenciaService } from '../../../core/services/incidencia.service';

import { RutFormatDirective } from '../../../shared/directives/rut-format.directive';

import { 
  AsignacionDTO,
  IncidenciaApiResponse,
  IncidenciaDTO, 
  GravedadIncidencia 
} from '../../../shared/models';

@Component({
  selector: 'app-admin-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule, RutFormatDirective],
  templateUrl: './admin-incidents.html',
  styleUrl: './admin-incidents.scss'
})
export class AdminIncidentsComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  public GravedadEnum = GravedadIncidencia;

  // RUT del administrador simulado
  private readonly RUT_ADMIN_ACTUAL = '14.555.666-7'; 

  incidencias: IncidenciaDTO[] = [];

  incidenciasFiltradas: IncidenciaDTO[] = [];

  public successMessage: string = '';
  public errorMessage: string = '';

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

  // Variables para Modal de Creación
  isCreateModalOpen = false;
  nuevaIncidencia = {
    descripcion: '',
    gravedad: GravedadIncidencia.LEVE,
    id_habitacion: 0,
    rutEstudiante: '',
  };

  studentLookupLoading = false;
  studentLookupMessage = '';
  studentActiveAssignment: AsignacionDTO | null = null;
  studentPreviousIncidents: IncidenciaDTO[] = [];
  private lastLookupRut = '';

  constructor(
    // 👇 Inyectamos la clase con el nuevo nombre
    private readonly incidenciaService: IncidenciaService,
    private readonly asignacionesService: AsignacionesService,
    private readonly authService: AuthService,
  ) {}

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
    this.successMessage = '';
    this.errorMessage = '';
    this.nuevaIncidencia = {
      descripcion: '',
      gravedad: GravedadIncidencia.LEVE,
      id_habitacion: 0,
      rutEstudiante: '',
    };
    this.clearStudentLookup();
    this.isCreateModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  onRutInputChange(): void {
    if (this.nuevaIncidencia.rutEstudiante.trim() !== this.lastLookupRut) {
      this.studentLookupMessage = '';
      this.studentActiveAssignment = null;
      this.studentPreviousIncidents = [];
      this.nuevaIncidencia.id_habitacion = 0;
      this.lastLookupRut = '';
    }
  }

  buscarDatosEstudiantePorRut(): void {
    const rut = this.nuevaIncidencia.rutEstudiante.trim();

    if (!rut) {
      this.clearStudentLookup();
      return;
    }

    if (rut === this.lastLookupRut) {
      return;
    }

    this.lastLookupRut = rut;
    this.studentLookupLoading = true;
    this.studentLookupMessage = '';
    this.studentActiveAssignment = null;
    this.studentPreviousIncidents = [];

    forkJoin({
      asignacion: this.asignacionesService.obtenerAsignacionActivaPorRut(rut),
      // 👇 Actualizado al nuevo nombre
      incidencias: this.incidenciaService.getIncidencias({ rut }),
    }).subscribe({
      next: ({ asignacion, incidencias }) => {
        this.studentLookupLoading = false;
        this.studentPreviousIncidents = incidencias.map((row) => this.mapApiToDto(row));

        if (asignacion.tieneAsignacion && asignacion.asignacion) {
          this.studentActiveAssignment = asignacion.asignacion;
          this.nuevaIncidencia.id_habitacion = asignacion.asignacion.idHabitacion;
          this.studentLookupMessage = 'Asignación activa encontrada. Se usará la habitación actual del estudiante.';
          this.cdr.detectChanges();
          return;
        }

        this.nuevaIncidencia.id_habitacion = 0;

        this.studentLookupMessage = asignacion.message ?? 'El estudiante no tiene asignación activa.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.studentLookupLoading = false;
        this.studentLookupMessage = 'No se pudieron cargar los datos del estudiante.';
        this.cdr.detectChanges();
      },
    });
  }

  enviarReporte(): void {
    if (!this.nuevaIncidencia.rutEstudiante.trim()) {
      alert('El RUT del estudiante no puede estar vacio.');
      return;
    }

    if (!this.nuevaIncidencia.descripcion.trim()) {
      alert('La descripción no puede estar vacía');
      return;
    }

    if (!this.studentActiveAssignment) {
      alert('No se puede crear la incidencia porque el estudiante no tiene una habitación activa.');
      return;
    }

    const payload = {
      descripcion: this.nuevaIncidencia.descripcion.trim(),
      gravedad: this.nuevaIncidencia.gravedad,
      idHabitacion: this.studentActiveAssignment.idHabitacion,
      rutEstudiante: this.nuevaIncidencia.rutEstudiante.trim(),
      rutAdmin: this.authService.getCurrentUser()?.rut ?? this.RUT_ADMIN_ACTUAL,
    };

    this.closeCreateModal();

    // 👇 Actualizado al nuevo nombre
    this.incidenciaService
      .createIncidencia(payload)
      .subscribe({
        next: () => {
          this.successMessage = 'Reporte enviado con exito.';
          this.cargarIncidencias();
          window.setTimeout(() => {
            this.successMessage = '';
          }, 6000);
        },
        error: () => {
          this.errorMessage = 'No se pudo enviar el reporte. Revisa backend y datos del formulario.';
          window.setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        },
      });
  }

  private cargarIncidencias(): void {
    // 👇 Actualizado al nuevo nombre
    this.incidenciaService.getIncidencias().subscribe({
        next: (rows) => {
          this.incidencias = rows.map((row) => this.mapApiToDto(row));
          this.periodos = this.resolvePeriods(this.incidencias);
          this.aplicarFiltros();
          this.cdr.detectChanges();
        },
        error: () => {
          this.incidencias = [];
          this.incidenciasFiltradas = [];
          this.cdr.detectChanges();
        },
      });
  }

  private clearStudentLookup(): void {
    this.studentLookupLoading = false;
    this.studentLookupMessage = '';
    this.studentActiveAssignment = null;
    this.studentPreviousIncidents = [];
    this.nuevaIncidencia.id_habitacion = 0;
    this.lastLookupRut = '';
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
      
      // 👇 3. Agregamos esta línea mágica para atrapar el piso
      numeroPiso: row.habitacion?.piso?.nroPiso
    };
  }
}