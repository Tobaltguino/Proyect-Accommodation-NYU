import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminRequestsService } from './admin-request.service';
import { 
  SolicitudDTO, 
  EstadoSolicitud, 
  Genero, 
  EdificioDTO, 
  HabitacionDTO, 
  IncidenciaDTO,
  GravedadIncidencia,
  AsignacionDTO,
  EstadoAsignacion
} from '../../../shared/models'; 

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

  private readonly RUT_ADMIN_ACTUAL = '14.555.666-7'; 
  private readonly NOMBRE_ADMIN_ACTUAL = 'Cristóbal Administrador';

  solicitudes: SolicitudDTO[] = [];
  solicitudesFiltradas: SolicitudDTO[] = [];
  
  filtroRut: string = '';
  filtroPeriodo: string = '';
  filtroEstado: EstadoSolicitud | '' = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  paginaActual: number = 1;
  itemsPorPagina: number = 20;
  isLoading: boolean = true;

  isModalOpen: boolean = false;
  solicitudSeleccionada: SolicitudDTO | null = null;
  incidenciasEstudiante: IncidenciaDTO[] = [];
  
  edificiosDisponibles: EdificioDTO[] = [
    {
      idEdificio: 1, nombre: 'Residencia Norte', ubicacion: 'Campus Norte', genero: Genero.MIXTO,
      pisos: [
        {
          idPiso: 1, nroPiso: 1, nombre: 'Piso 1', idEdificio: 1, habitaciones: [
            { idHabitacion: 10, nroHabitacion: 101, capacidadActual: 2, capacidadTotal: 2, disponibilidad: true, idPiso: 1 },
            { idHabitacion: 11, nroHabitacion: 102, capacidadActual: 1, capacidadTotal: 2, disponibilidad: true, idPiso: 1 },
            { idHabitacion: 12, nroHabitacion: 103, capacidadActual: 0, capacidadTotal: 2, disponibilidad: true, idPiso: 1 }
          ]
        }
      ]
    }
  ];

  edificiosFiltrados: EdificioDTO[] = [];
  edificioSeleccionadoMapa: EdificioDTO | null = null;
  matriculaActiva: boolean = false;
  habitacionSeleccionadaId: number | null = null;

  constructor(
    private readonly adminService: AdminRequestsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.isLoading = true;
    this.adminService.obtenerTodasLasSolicitudes()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (dataCruda: any) => {
          if (!dataCruda || !Array.isArray(dataCruda)) {
            this.solicitudes = [];
          } else {
            this.solicitudes = dataCruda.map((dbSol: any) => this.mapearSolicitudDelBackend(dbSol));
          }
          
          this.solicitudesFiltradas = [...this.solicitudes];
        },
        error: (err: unknown) => {
          console.error('Error al cargar solicitudes de admin:', err);
        }
      });
  }

  private mapearSolicitudDelBackend(dbSol: any): SolicitudDTO {
    let estadoEnum = EstadoSolicitud.PENDIENTE;
    const estadoStr = (dbSol.estado || dbSol.solicitud_estado || '').toLowerCase();
    
    if (estadoStr === 'en revision' || estadoStr === 'en revisión') estadoEnum = EstadoSolicitud.EN_REVISION;
    else if (estadoStr === 'aprobada') estadoEnum = EstadoSolicitud.APROBADA;
    else if (estadoStr === 'rechazada') estadoEnum = EstadoSolicitud.RECHAZADA;

    const rutReal = dbSol.rutEstudiante || dbSol.rut_estudiante || dbSol.rut || 'Sin RUT';
    const nombreReal = dbSol.nombreEstudiante || dbSol.nombre_estudiante || dbSol.nombre || dbSol.usuario_nombre || 'Estudiante';
    const periodoReal = dbSol.nombrePeriodo || dbSol.periodo_nombre || dbSol.semester || dbSol.semestre || 'Desconocido';

    return {
      idSolicitud: dbSol.idSolicitud || dbSol.id_solicitud,
      estado: estadoEnum,
      fechaSolicitud: dbSol.fechaSolicitud || dbSol.fecha_solicitud || '-',
      idPeriodo: dbSol.idPeriodo || dbSol.id_periodo || 1,
      nombrePeriodo: String(periodoReal), 
      rutEstudiante: String(rutReal),
      nombreEstudiante: String(nombreReal), 
      generoEstudiante: Genero.MIXTO, 
      rutAdmin: dbSol.rutAdmin || dbSol.rut_admin || undefined,
      nombreAdmin: (dbSol.rutAdmin || dbSol.rut_admin) ? 'Admin Asignado' : undefined
    };
  }

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
      const matchRut = this.filtroRut 
        ? sol.rutEstudiante.toLowerCase().replace(/\s+/g, '').includes(this.filtroRut.toLowerCase().replace(/\s+/g, '')) 
        : true;
        
      return matchPeriodo && matchEstado && matchRut;
    });
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroRut = '';
    this.filtroPeriodo = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  abrirModal(solicitud: SolicitudDTO): void {
    this.solicitudSeleccionada = solicitud;
    
    if (solicitud.estado === EstadoSolicitud.PENDIENTE) {
      solicitud.estado = EstadoSolicitud.EN_REVISION;
      solicitud.rutAdmin = this.RUT_ADMIN_ACTUAL;
      solicitud.nombreAdmin = this.NOMBRE_ADMIN_ACTUAL;

      this.adminService.cambiarEstadoSolicitud(solicitud.idSolicitud, 'En Revision')
        .subscribe({
          next: () => console.log(`BD actualizada: Solicitud ${solicitud.idSolicitud} en revisión.`),
          error: (err) => console.error('Error al actualizar estado a En Revisión:', err)
        });
    }

    this.incidenciasEstudiante = [
      { 
        idIncidencia: 1, fecha: '2025-10-12', descripcion: 'Ruido excesivo en horario de descanso', 
        gravedad: GravedadIncidencia.MODERADO,
        idHabitacion: 10, nroHabitacion: 101, nombreEdificio: 'Residencia Norte',
        rutEstudiante: solicitud.rutEstudiante, nombreEstudiante: solicitud.nombreEstudiante,
        rutAdmin: '12.888.777-6', nombreAdmin: 'Admin Guardia', periodo: '2025-2'
      }
    ];

    this.edificiosFiltrados = this.edificiosDisponibles.filter(
      e => e.genero === Genero.MIXTO || e.genero === solicitud.generoEstudiante
    );

    this.edificioSeleccionadoMapa = this.edificiosFiltrados.length > 0 ? this.edificiosFiltrados[0] : null;
    this.matriculaActiva = false;
    this.habitacionSeleccionadaId = null;
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.solicitudSeleccionada = null;
  }

  seleccionarHabitacion(habitacion: HabitacionDTO): void {
    if (habitacion.capacidadActual >= (habitacion.capacidadTotal || 0) || !habitacion.disponibilidad) return; 
    this.habitacionSeleccionadaId = habitacion.idHabitacion;
  }

  esHabitacionSeleccionada(id: number): boolean {
    return this.habitacionSeleccionadaId === id;
  }

  procesarSolicitud(accion: 'Aprobar' | 'Rechazar'): void {
    if (!this.solicitudSeleccionada) return;

    const idSolicitud = this.solicitudSeleccionada.idSolicitud;

    if (accion === 'Aprobar') {
      if (!this.habitacionSeleccionadaId) return;

      this.adminService.crearAsignacion(idSolicitud, this.habitacionSeleccionadaId).subscribe({
        next: (res) => {
          if (this.solicitudSeleccionada) {
            this.solicitudSeleccionada.estado = EstadoSolicitud.APROBADA;
          }
          this.aplicarFiltros();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al crear la asignación:', err);
          alert('Ocurrió un error al intentar aprobar y asignar la habitación. Revisa la consola para más detalles.');
        }
      });
    } else if (accion === 'Rechazar') {
      this.adminService.cambiarEstadoSolicitud(idSolicitud, 'Rechazada').subscribe({
        next: (res) => {
          if (this.solicitudSeleccionada) {
            this.solicitudSeleccionada.estado = EstadoSolicitud.RECHAZADA;
          }
          this.aplicarFiltros();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al rechazar la solicitud:', err);
          alert('Ocurrió un error al intentar rechazar la solicitud.');
        }
      });
    }
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
}
