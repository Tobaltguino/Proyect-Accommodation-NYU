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

  incidencias: IncidenciaDTO[] = [
    {
      idIncidencia: 1,
      descripcion: 'Fuga de agua importante en el lavamanos del baño, el piso se está inundando rápidamente y necesitamos que venga alguien pronto a cortar el paso de agua.',
      estado: EstadoIncidencia.PENDIENTE,
      fecha: '2026-04-20',
      gravedad: GravedadIncidencia.MODERADO,
      idHabitacion: 10,
      nroHabitacion: 101,
      nombreEdificio: 'Residencia Masculina',
      rutEstudiante: '21.345.678-9',
      nombreEstudiante: 'Juan Pérez',
      periodo: '2026-1',
      rutAdmin: null
    },
    {
      idIncidencia: 2,
      descripcion: 'Ampolleta quemada en el escritorio.',
      estado: EstadoIncidencia.RESUELTA,
      fecha: '2026-04-15',
      gravedad: GravedadIncidencia.LEVE,
      idHabitacion: 25,
      nroHabitacion: 205,
      nombreEdificio: 'Residencia Femenina',
      rutEstudiante: '20.123.456-7',
      nombreEstudiante: 'María González',
      periodo: '2026-1',
      rutAdmin: '11.222.333-4',
      nombreAdmin: 'Admin Mantenimiento'
    },
    {
      idIncidencia: 3,
      descripcion: 'Cortocircuito en el enchufe principal.',
      estado: EstadoIncidencia.EN_PROCESO,
      fecha: '2026-04-26',
      gravedad: GravedadIncidencia.GRAVE,
      idHabitacion: 30,
      nroHabitacion: 310,
      nombreEdificio: 'Residencia Masculina',
      rutEstudiante: '19.876.543-2',
      nombreEstudiante: 'Carlos Silva',
      periodo: '2026-1',
      rutAdmin: '12.888.777-6',
      nombreAdmin: 'Admin Noche'
    }
  ];

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

  constructor(private readonly adminIncidentsService: AdminIncidentsService) { }

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
      const matchRut = rutBuscado ? inc.rutEstudiante.toLowerCase().includes(rutBuscado) : true;

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
      this.selectedIncident.rutAdmin = this.RUT_ADMIN_ACTUAL;
      this.selectedIncident.nombreAdmin = this.NOMBRE_ADMIN_ACTUAL;
      this.aplicarFiltros();

      this.adminIncidentsService
        .updateEstadoIncidencia(this.selectedIncident.id_incidencia, {
          estado: EstadoIncidencia.EN_PROCESO,
          rutAdmin: this.RUT_ADMIN_ACTUAL,
        })
        .subscribe({
          next: (updated) => {
            this.syncIncidentFromApi(updated);
            this.aplicarFiltros();
          },
          error: () => {
            alert('No se pudo marcar la incidencia en proceso.');
          },
        });

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

      this.selectedIncident.rutAdmin = this.RUT_ADMIN_ACTUAL;
      this.selectedIncident.nombreAdmin = this.NOMBRE_ADMIN_ACTUAL;

      this.aplicarFiltros();
      this.closeModal();
      console.log(`Incidencia ${this.selectedIncident.idIncidencia} resuelta por ${this.NOMBRE_ADMIN_ACTUAL}`);
    }
  }
}
