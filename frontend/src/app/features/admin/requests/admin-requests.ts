import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  SolicitudDTO, 
  EstadoSolicitud, 
  Genero, 
  EdificioDTO, 
  HabitacionDTO, 
  IncidenciaDTO,
  GravedadIncidencia,
  EstadoIncidencia,
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

  // RUT del administrador que está usando el sistema (simulado)
  private readonly RUT_ADMIN_ACTUAL = '14.555.666-7'; 
  private readonly NOMBRE_ADMIN_ACTUAL = 'Cristóbal Administrador';

  solicitudes: SolicitudDTO[] = [
    {
      idSolicitud: 101, 
      estado: EstadoSolicitud.PENDIENTE, 
      fechaSolicitud: '2026-04-25',
      idPeriodo: 1, 
      nombrePeriodo: '2026-1', 
      rutEstudiante: '21.345.678-9', 
      nombreEstudiante: 'Valentina Soto', 
      generoEstudiante: Genero.FEMENINO,
      rutAdmin: null
    },
    {
      idSolicitud: 102, 
      estado: EstadoSolicitud.EN_REVISION, 
      fechaSolicitud: '2026-04-22',
      idPeriodo: 1, 
      nombrePeriodo: '2026-1', 
      rutEstudiante: '20.123.456-7', 
      nombreEstudiante: 'Matías Fernández', 
      generoEstudiante: Genero.MASCULINO,
      rutAdmin: '12.999.888-7',
      nombreAdmin: 'Admin Previo'
    }
  ];

  solicitudesFiltradas: SolicitudDTO[] = [];
  filtroPeriodo: string = '';
  filtroEstado: EstadoSolicitud | '' = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  // Variables de Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 20;

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
    },
    {
      idEdificio: 2, nombre: 'Pabellón Sur', ubicacion: 'Campus Sur', genero: Genero.FEMENINO,
      pisos: [
        {
          idPiso: 2, nroPiso: 1, nombre: 'Piso 1', idEdificio: 2, habitaciones: [
            { idHabitacion: 20, nroHabitacion: 201, capacidadActual: 0, capacidadTotal: 4, disponibilidad: true, idPiso: 2 }
          ]
        }
      ]
    }
  ];

  edificiosFiltrados: EdificioDTO[] = [];
  edificioSeleccionadoMapa: EdificioDTO | null = null;
  matriculaActiva: boolean = false;
  habitacionSeleccionadaId: number | null = null;

  ngOnInit(): void {
    this.solicitudesFiltradas = [...this.solicitudes];
    this.filtroPeriodo = '2026-1';
    this.aplicarFiltros();
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
    
    if (solicitud.estado === EstadoSolicitud.PENDIENTE) {
      solicitud.estado = EstadoSolicitud.EN_REVISION;
      // Vinculamos al admin que inició la revisión
      solicitud.rutAdmin = this.RUT_ADMIN_ACTUAL;
      solicitud.nombreAdmin = this.NOMBRE_ADMIN_ACTUAL;
    }

    this.incidenciasEstudiante = [
      { 
        idIncidencia: 1, fecha: '2025-10-12', descripcion: 'Ruido excesivo en horario de descanso', 
        gravedad: GravedadIncidencia.MODERADO, estado: EstadoIncidencia.RESUELTA,
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

    // Al procesar, aseguramos que el administrador actual quede registrado
    this.solicitudSeleccionada.rutAdmin = this.RUT_ADMIN_ACTUAL;
    this.solicitudSeleccionada.nombreAdmin = this.NOMBRE_ADMIN_ACTUAL;

    if (accion === 'Rechazar') {
      this.solicitudSeleccionada.estado = EstadoSolicitud.RECHAZADA;
    } else if (accion === 'Aprobar') {
      this.solicitudSeleccionada.estado = EstadoSolicitud.APROBADA;
      
      const nuevaAsignacion: Partial<AsignacionDTO> = {
        fechaAsignacion: new Date().toISOString().split('T')[0],
        estado: EstadoAsignacion.ACTIVA,
        idHabitacion: this.habitacionSeleccionadaId!,
        idPeriodo: this.solicitudSeleccionada.idPeriodo,
        rutEstudiante: this.solicitudSeleccionada.rutEstudiante,
        rutAdmin: this.RUT_ADMIN_ACTUAL
      };
      console.log('Solicitud Aprobada. Creando Asignación:', nuevaAsignacion);
    }

    this.aplicarFiltros();
    this.cerrarModal();
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