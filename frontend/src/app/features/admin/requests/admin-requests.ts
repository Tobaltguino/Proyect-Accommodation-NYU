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
  EstadoIncidencia
} from '../../../shared/models';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-requests.html',
  styleUrl: './admin-requests.scss'
})
export class AdminRequestsComponent implements OnInit {
  // 👇 Exponemos los Enums para que el HTML los pueda leer
  public GravedadEnum = GravedadIncidencia;
  public EstadoEnum = EstadoSolicitud;

  solicitudes: SolicitudDTO[] = [
    {
      id_solicitud: 101, estado: EstadoSolicitud.PENDIENTE, fecha_solicitud: '2026-04-25',
      id_periodo: 1, nombre_periodo: '2026-1', id_usuario: 50, rut_usuario: '21.345.678-9', nombre_usuario: 'Valentina Soto', genero_usuario: Genero.FEMENINO
    },
    {
      id_solicitud: 102, estado: EstadoSolicitud.EN_REVISION, fecha_solicitud: '2026-04-22',
      id_periodo: 1, nombre_periodo: '2026-1', id_usuario: 51, rut_usuario: '20.123.456-7', nombre_usuario: 'Matías Fernández', genero_usuario: Genero.MASCULINO
    }
  ];

  solicitudesFiltradas: SolicitudDTO[] = [];
  filtroPeriodo: string = '';
  filtroEstado: EstadoSolicitud | '' = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  isModalOpen: boolean = false;
  solicitudSeleccionada: SolicitudDTO | null = null;
  incidenciasEstudiante: IncidenciaDTO[] = [];
  
  edificiosDisponibles: EdificioDTO[] = [
    {
      id_edificio: 1, nombre: 'Residencia Norte', ubicacion: 'Campus Norte', genero: Genero.MIXTO,
      pisos: [
        {
          id_piso: 1, nro_piso: 1, nombre: 'Piso 1', id_edificio: 1, habitaciones: [
            { id_habitacion: 10, nro_habitacion: 101, capacidad_actual: 2, capacidad_total: 2, disponibilidad: true, id_piso: 1 },
            { id_habitacion: 11, nro_habitacion: 102, capacidad_actual: 1, capacidad_total: 2, disponibilidad: true, id_piso: 1 },
            { id_habitacion: 12, nro_habitacion: 103, capacidad_actual: 0, capacidad_total: 2, disponibilidad: true, id_piso: 1 }
          ]
        }
      ]
    },
    {
      id_edificio: 2, nombre: 'Pabellón Sur', ubicacion: 'Campus Sur', genero: Genero.FEMENINO,
      pisos: [
        {
          id_piso: 2, nro_piso: 1, nombre: 'Piso 1', id_edificio: 2, habitaciones: [
            { id_habitacion: 20, nro_habitacion: 201, capacidad_actual: 0, capacidad_total: 4, disponibilidad: true, id_piso: 2 },
            { id_habitacion: 21, nro_habitacion: 202, capacidad_actual: 1, capacidad_total: 2, disponibilidad: true, id_piso: 2 }
          ]
        }
      ]
    },
    {
      id_edificio: 3, nombre: 'Residencia Este', ubicacion: 'Campus Este', genero: Genero.FEMENINO,
      pisos: [
        {
          id_piso: 3, nro_piso: 1, nombre: 'Piso 1', id_edificio: 3, habitaciones: [
            { id_habitacion: 30, nro_habitacion: 301, capacidad_actual: 0, capacidad_total: 2, disponibilidad: true, id_piso: 3 }
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

  aplicarFiltros(): void {
    this.solicitudesFiltradas = this.solicitudes.filter(sol => {
      const matchPeriodo = this.filtroPeriodo ? sol.nombre_periodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? sol.estado === this.filtroEstado : true;
      return matchPeriodo && matchEstado;
    });
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
    }

    this.incidenciasEstudiante = [
      { 
        id_incidencia: 1, fecha: '2025-10-12', descripcion: 'Ruido excesivo en horario de descanso', 
        gravedad: GravedadIncidencia.MODERADO, estado: EstadoIncidencia.RESUELTA,
        nro_habitacion: 101, nombre_edificio: 'Residencia Norte',
        rut_usuario: solicitud.rut_usuario, nombre_usuario: solicitud.nombre_usuario, periodo: '2025-2'
      }
    ];

    this.edificiosFiltrados = this.edificiosDisponibles.filter(
      e => e.genero === Genero.MIXTO || e.genero === solicitud.genero_usuario
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

  cambiarEdificioMapa(id_edificio_str: string): void {
    const id = parseInt(id_edificio_str, 10);
    this.edificioSeleccionadoMapa = this.edificiosFiltrados.find(e => e.id_edificio === id) || null;
    this.habitacionSeleccionadaId = null; 
  }

  seleccionarHabitacion(habitacion: HabitacionDTO): void {
    if (habitacion.capacidad_actual >= habitacion.capacidad_total || !habitacion.disponibilidad) {
      return; 
    }
    this.habitacionSeleccionadaId = habitacion.id_habitacion;
  }

  esHabitacionSeleccionada(id: number): boolean {
    return this.habitacionSeleccionadaId === id;
  }

  procesarSolicitud(accion: 'Aprobar' | 'Rechazar'): void {
    if (!this.solicitudSeleccionada) return;

    if (accion === 'Rechazar') {
      this.solicitudSeleccionada.estado = EstadoSolicitud.RECHAZADA;
    } else if (accion === 'Aprobar') {
      this.solicitudSeleccionada.estado = EstadoSolicitud.APROBADA;
      
      const nuevaAsignacion = {
        fecha_asignacion: new Date().toISOString().split('T')[0],
        estado: 'Activa',
        id_habitacion: this.habitacionSeleccionadaId,
        id_periodo: this.solicitudSeleccionada.id_periodo,
        id_usuario: this.solicitudSeleccionada.id_usuario
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