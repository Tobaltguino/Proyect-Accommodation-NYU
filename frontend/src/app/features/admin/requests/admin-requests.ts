import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  SolicitudDTO, 
  EstadoSolicitud, 
  Genero, 
  EdificioDTO, 
  HabitacionDTO, 
  IncidenciaDTO,
  GravedadIncidencia
} from '../../../shared/models';
import { SolicitudesService } from '../../../core/services/solicitudes.service';
import { InfraestructuraService } from '../../../core/services/infraestructura.service';
import { AsignacionesService } from '../../../core/services/asignaciones.service';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-requests.html',
  styleUrl: './admin-requests.scss'
})
export class AdminRequestsComponent implements OnInit {
  public GravedadEnum = GravedadIncidencia;
  public EstadoEnum = EstadoSolicitud;

  private solicitudesService = inject(SolicitudesService);
  private infraestructuraService = inject(InfraestructuraService);
  private asignacionesService = inject(AsignacionesService);

  // RUT del administrador que está usando el sistema (simulado)
  private readonly RUT_ADMIN_ACTUAL = '14.555.666-7'; 
  private readonly NOMBRE_ADMIN_ACTUAL = 'Cristóbal Administrador';

  solicitudes: SolicitudDTO[] = [];

  solicitudesFiltradas: SolicitudDTO[] = [];
  filtroPeriodo: string = '';
  filtroEstado: EstadoSolicitud | '' = '';
  periodos: string[] = [];

  // Variables de Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 20;

  isModalOpen: boolean = false;
  solicitudSeleccionada: SolicitudDTO | null = null;
  incidenciasEstudiante: IncidenciaDTO[] = [];
  
  edificiosDisponibles: EdificioDTO[] = [];

  edificiosFiltrados: EdificioDTO[] = [];
  edificioSeleccionadoMapa: EdificioDTO | null = null;
  matriculaActiva: boolean = false;
  habitacionSeleccionadaId: number | null = null;

  ngOnInit(): void {
    this.cargarSolicitudes();
    this.cargarInfraestructura();
  }

  cargarSolicitudes(): void {
    this.solicitudesService.obtenerTodasAdmin().subscribe({
      next: (data: SolicitudDTO[]) => {
        this.solicitudes = data.map(solicitud => this.normalizarSolicitud(solicitud));
        this.periodos = Array.from(new Set(this.solicitudes.map(sol => sol.nombrePeriodo || String(sol.idPeriodo))));
        this.aplicarFiltros();
      },
      error: (err: any) => console.error('Error al cargar solicitudes', err)
    });
  }

  cargarInfraestructura(): void {
    this.infraestructuraService.obtenerInfraestructuraCompleta().subscribe({
      next: (data: EdificioDTO[]) => {
        this.edificiosDisponibles = data;
      },
      error: (err: any) => console.error('Error al cargar infraestructura', err)
    });
  }

  // Getters de Paginación
  get solicitudesPaginadas(): SolicitudDTO[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.solicitudesFiltradas.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.solicitudesFiltradas.length / this.itemsPorPagina) || 1;
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  aplicarFiltros(): void {
    this.solicitudesFiltradas = this.solicitudes.filter(sol => {
      const matchPeriodo = this.filtroPeriodo ? sol.nombrePeriodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? sol.estado === this.filtroEstado : true;
      return matchPeriodo && matchEstado;
    });

    // Reiniciar paginación al filtrar
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  abrirModal(solicitud: SolicitudDTO): void {
    this.solicitudSeleccionada = solicitud;

    this.incidenciasEstudiante = [
      { 
        idIncidencia: 1, fecha: '2025-10-12', descripcion: 'Ruido excesivo en horario de descanso', 
        gravedad: GravedadIncidencia.MODERADO,
        idHabitacion: 10, nroHabitacion: 101, nombreEdificio: 'Residencia Norte',
        rutEstudiante: solicitud.rutEstudiante, nombreEstudiante: solicitud.nombreEstudiante,
        rutAdmin: '12.888.777-6', nombreAdmin: 'Admin Guardia', periodo: '2025-2'
      }
    ];

    this.edificiosFiltrados = this.filtrarEdificiosPorSolicitud(solicitud);

    this.edificioSeleccionadoMapa = this.edificiosFiltrados.length > 0 ? this.edificiosFiltrados[0] : null;
    this.matriculaActiva = false;
    this.habitacionSeleccionadaId = null;
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.solicitudSeleccionada = null;
  }

  cambiarEdificioMapa(idEdificioStr: string): void {
    const id = parseInt(idEdificioStr, 10);
    this.edificioSeleccionadoMapa = this.edificiosFiltrados.find(e => e.idEdificio === id) || null;
    this.habitacionSeleccionadaId = null; 
  }

  seleccionarHabitacion(habitacion: HabitacionDTO): void {
    if (habitacion.capacidadActual >= (habitacion.capacidadTotal || 0) || !habitacion.disponibilidad) {
      return; 
    }
    this.habitacionSeleccionadaId = habitacion.idHabitacion;
  }

  esHabitacionSeleccionada(id: number): boolean {
    return this.habitacionSeleccionadaId === id;
  }

  procesarSolicitud(accion: 'Aprobar' | 'Rechazar'): void {
    if (!this.solicitudSeleccionada) return;

    if (accion === 'Rechazar') {
      this.solicitudesService
        .cambiarEstadoAdmin(this.solicitudSeleccionada.idSolicitud, EstadoSolicitud.RECHAZADA)
        .subscribe({
          next: () => this.finalizarProcesamiento(),
          error: (err: any) => console.error('Error al rechazar solicitud', err)
        });

      return;
    }

    if (!this.habitacionSeleccionadaId) {
      return;
    }

    this.asignacionesService
      .crearAsignacion(this.solicitudSeleccionada.idSolicitud, this.habitacionSeleccionadaId)
      .subscribe({
        next: () => this.finalizarProcesamiento(),
        error: (err: any) => console.error('Error al aprobar y asignar solicitud', err)
      });
  }

  getClassForEstado(estado: string): string {
    switch(estado) {
      case EstadoSolicitud.PENDIENTE: return 'pen';
      case EstadoSolicitud.EN_REVISION: return 'rev';
      case EstadoSolicitud.APROBADA: return 'apr';
      case EstadoSolicitud.RECHAZADA: return 'rec';
      default: return '';
    }
  }

  private finalizarProcesamiento(): void {
    this.cerrarModal();
    this.cargarSolicitudes();
    this.cargarInfraestructura();
  }

  private filtrarEdificiosPorSolicitud(solicitud: SolicitudDTO): EdificioDTO[] {
    if (!solicitud.generoEstudiante) {
      return this.edificiosDisponibles;
    }

    return this.edificiosDisponibles.filter(
      e => e.genero === Genero.MIXTO || e.genero === solicitud.generoEstudiante
    );
  }

  private normalizarSolicitud(solicitud: any): SolicitudDTO {
    const idPeriodo = solicitud.idPeriodo ?? solicitud.id_periodo;
    const rutEstudiante = solicitud.rutEstudiante ?? solicitud.rut_estudiante;

    return {
      idSolicitud: solicitud.idSolicitud ?? solicitud.id_solicitud,
      estado: solicitud.estado,
      fechaSolicitud: solicitud.fechaSolicitud ?? solicitud.fecha_solicitud,
      idPeriodo,
      idAsignacion: solicitud.idAsignacion ?? solicitud.id_asignacion ?? null,
      rutEstudiante,
      rutAdmin: solicitud.rutAdmin ?? solicitud.rut_admin ?? null,
      nombrePeriodo: solicitud.nombrePeriodo ?? solicitud.periodo?.nombre ?? String(idPeriodo),
      nombreEstudiante: solicitud.nombreEstudiante ?? solicitud.usuario?.nombre ?? rutEstudiante,
      generoEstudiante: solicitud.generoEstudiante ?? solicitud.usuario?.genero,
      nombreAdmin: solicitud.nombreAdmin,
    };
  }
}
