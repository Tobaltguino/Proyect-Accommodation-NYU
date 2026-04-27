import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type EstadoSolicitud = 'Pendiente' | 'En Revision' | 'Aprobada' | 'Rechazada' | '';
export type Genero = 'Masculino' | 'Femenino' | 'Mixto';

export interface Solicitud {
  id_solicitud: number;
  estado: EstadoSolicitud;
  fecha_solicitud: string;
  id_periodo: number;
  nombre_periodo: string;
  id_usuario: number;
  rut_usuario: string;
  nombre_usuario: string;
  genero_usuario: Genero; 
}

export interface Incidencia {
  id_incidencia: number;
  fecha: string;
  descripcion: string;
  gravedad: 'Baja' | 'Media' | 'Alta';
}

export interface Habitacion {
  id_habitacion: number;
  nro_habitacion: number;
  capacidad_actual: number; 
  capacidad_total: number;
  disponibilidad: boolean;
}

export interface Piso {
  id_piso: number;
  nro_piso: number;
  habitaciones: Habitacion[];
}

export interface Edificio {
  id_edificio: number;
  nombre: string;
  genero: Genero;
  pisos: Piso[];
}

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-requests.html',
  styleUrl: './admin-requests.scss'
})
export class AdminRequestsComponent implements OnInit {
  solicitudes: Solicitud[] = [
    {
      id_solicitud: 101, estado: 'Pendiente', fecha_solicitud: '2026-04-25',
      id_periodo: 1, nombre_periodo: '2026-1', id_usuario: 50, rut_usuario: '21.345.678-9', nombre_usuario: 'Valentina Soto', genero_usuario: 'Femenino'
    },
    {
      id_solicitud: 102, estado: 'En Revision', fecha_solicitud: '2026-04-22',
      id_periodo: 1, nombre_periodo: '2026-1', id_usuario: 51, rut_usuario: '20.123.456-7', nombre_usuario: 'Matías Fernández', genero_usuario: 'Masculino'
    }
  ];

  solicitudesFiltradas: Solicitud[] = [];
  filtroPeriodo: string = '';
  filtroEstado: EstadoSolicitud = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  // Estado del Modal
  isModalOpen: boolean = false;
  solicitudSeleccionada: Solicitud | null = null;
  incidenciasEstudiante: Incidencia[] = [];
  
  // Mapa de Edificios (Agregué un tercer edificio para probar múltiples opciones femeninas/mixtas)
  edificiosDisponibles: Edificio[] = [
    {
      id_edificio: 1, nombre: 'Residencia Norte', genero: 'Mixto',
      pisos: [
        {
          id_piso: 1, nro_piso: 1, habitaciones: [
            { id_habitacion: 10, nro_habitacion: 101, capacidad_actual: 2, capacidad_total: 2, disponibilidad: true },
            { id_habitacion: 11, nro_habitacion: 102, capacidad_actual: 1, capacidad_total: 2, disponibilidad: true },
            { id_habitacion: 12, nro_habitacion: 103, capacidad_actual: 0, capacidad_total: 2, disponibilidad: true }
          ]
        }
      ]
    },
    {
      id_edificio: 2, nombre: 'Pabellón Sur', genero: 'Femenino',
      pisos: [
        {
          id_piso: 2, nro_piso: 1, habitaciones: [
            { id_habitacion: 20, nro_habitacion: 201, capacidad_actual: 0, capacidad_total: 4, disponibilidad: true },
            { id_habitacion: 21, nro_habitacion: 202, capacidad_actual: 1, capacidad_total: 2, disponibilidad: true }
          ]
        }
      ]
    },
    {
      id_edificio: 3, nombre: 'Residencia Este', genero: 'Femenino',
      pisos: [
        {
          id_piso: 3, nro_piso: 1, habitaciones: [
            { id_habitacion: 30, nro_habitacion: 301, capacidad_actual: 0, capacidad_total: 2, disponibilidad: true }
          ]
        }
      ]
    }
  ];

  // Lógica de filtrado de edificios
  edificiosFiltrados: Edificio[] = [];
  edificioSeleccionadoMapa: Edificio | null = null;
  
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

  abrirModal(solicitud: Solicitud): void {
    this.solicitudSeleccionada = solicitud;
    
    if (solicitud.estado === 'Pendiente') {
      solicitud.estado = 'En Revision';
    }

    this.incidenciasEstudiante = [
      { id_incidencia: 1, fecha: '2025-10-12', descripcion: 'Ruido excesivo en horario de descanso', gravedad: 'Media' }
    ];

    // 1. Filtrar TODOS los edificios aptos para el género del estudiante
    this.edificiosFiltrados = this.edificiosDisponibles.filter(
      e => e.genero === 'Mixto' || e.genero === solicitud.genero_usuario
    );

    // 2. Preseleccionar el primer edificio de la lista
    this.edificioSeleccionadoMapa = this.edificiosFiltrados.length > 0 ? this.edificiosFiltrados[0] : null;

    this.matriculaActiva = false;
    this.habitacionSeleccionadaId = null;
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.solicitudSeleccionada = null;
  }

  // Se ejecuta cuando el administrador cambia el edificio en el desplegable
  cambiarEdificioMapa(id_edificio_str: string): void {
    const id = parseInt(id_edificio_str, 10);
    this.edificioSeleccionadoMapa = this.edificiosFiltrados.find(e => e.id_edificio === id) || null;
    // Si cambia de edificio, borramos la habitación previamente seleccionada por seguridad
    this.habitacionSeleccionadaId = null; 
  }

  seleccionarHabitacion(habitacion: Habitacion): void {
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
      this.solicitudSeleccionada.estado = 'Rechazada';
    } else if (accion === 'Aprobar') {
      this.solicitudSeleccionada.estado = 'Aprobada';
      
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

  getClassForEstado(estado: EstadoSolicitud): string {
    switch(estado) {
      case 'Pendiente': return 'pen';
      case 'En Revision': return 'rev';
      case 'Aprobada': return 'apr';
      case 'Rechazada': return 'rec';
      default: return '';
    }
  }
}