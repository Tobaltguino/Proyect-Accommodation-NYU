import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type EstadoAsignacion = 'Activa' | 'Finalizada' | 'Renunciada' | '';

export interface Asignacion {
  id_asignacion: number;
  fecha_asignacion: string;
  fecha_check_in: string | null;
  fecha_check_out: string | null;
  estado: EstadoAsignacion;
  
  // IDs originales de tu tabla
  id_habitacion: number;
  id_periodo: number;
  id_usuario: number;

  // Datos simulados provenientes de un JOIN para la UI
  nombre_estudiante: string;
  rut_estudiante: string;
  nombre_periodo: string;
  numero_habitacion: string;
  nombre_edificio: string;
}

@Component({
  selector: 'app-admin-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-assignments.html',
  styleUrl: './admin-assignments.scss'
})
export class AdminAssignmentsComponent implements OnInit {
  asignaciones: Asignacion[] = [
    {
      id_asignacion: 1,
      fecha_asignacion: '2026-03-15',
      fecha_check_in: null, // Aún no llega
      fecha_check_out: null,
      estado: 'Activa',
      id_habitacion: 10, id_periodo: 1, id_usuario: 50,
      nombre_estudiante: 'Valentina Soto', rut_estudiante: '21.345.678-9',
      nombre_periodo: '2026-1', numero_habitacion: '101', nombre_edificio: 'Residencia Norte'
    },
    {
      id_asignacion: 2,
      fecha_asignacion: '2026-03-10',
      fecha_check_in: '2026-03-25', // Ya está viviendo ahí
      fecha_check_out: null,
      estado: 'Activa',
      id_habitacion: 20, id_periodo: 1, id_usuario: 51,
      nombre_estudiante: 'Matías Fernández', rut_estudiante: '20.123.456-7',
      nombre_periodo: '2026-1', numero_habitacion: '201', nombre_edificio: 'Pabellón Sur'
    },
    {
      id_asignacion: 3,
      fecha_asignacion: '2025-08-01',
      fecha_check_in: '2025-08-15',
      fecha_check_out: '2025-12-20', // Ya se fue
      estado: 'Finalizada',
      id_habitacion: 12, id_periodo: 2, id_usuario: 52,
      nombre_estudiante: 'Camila Rojas', rut_estudiante: '19.876.543-2',
      nombre_periodo: '2025-2', numero_habitacion: '103', nombre_edificio: 'Residencia Norte'
    },
    {
      id_asignacion: 4,
      fecha_asignacion: '2026-04-01',
      fecha_check_in: null,
      fecha_check_out: '2026-04-10', // Renunció antes de entrar o poco después
      estado: 'Renunciada',
      id_habitacion: 11, id_periodo: 1, id_usuario: 53,
      nombre_estudiante: 'Sebastián Morales', rut_estudiante: '22.111.222-3',
      nombre_periodo: '2026-1', numero_habitacion: '102', nombre_edificio: 'Residencia Norte'
    }
  ];

  asignacionesFiltradas: Asignacion[] = [];

  // Filtros
  filtroPeriodo: string = '';
  filtroEstado: EstadoAsignacion = '';
  filtroBusqueda: string = '';
  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  // Modal de confirmación para acciones peligrosas
  isConfirmModalOpen = false;
  accionPendiente: { tipo: 'CHECKOUT' | 'RENUNCIA', asignacion: Asignacion } | null = null;

  ngOnInit(): void {
    this.asignacionesFiltradas = [...this.asignaciones];
    this.filtroPeriodo = '2026-1';
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const busqueda = this.filtroBusqueda.toLowerCase();
    
    this.asignacionesFiltradas = this.asignaciones.filter(asig => {
      const matchPeriodo = this.filtroPeriodo ? asig.nombre_periodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? asig.estado === this.filtroEstado : true;
      const matchBusqueda = busqueda ? 
        (asig.nombre_estudiante.toLowerCase().includes(busqueda) || 
         asig.rut_estudiante.toLowerCase().includes(busqueda) ||
         asig.numero_habitacion.toLowerCase().includes(busqueda)) : true;
      
      return matchPeriodo && matchEstado && matchBusqueda;
    });
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroEstado = '';
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  // --- ACCIONES RÁPIDAS ---

  marcarCheckIn(asignacion: Asignacion): void {
    // Simula registrar el check-in con la fecha actual
    const hoy = new Date().toISOString().split('T')[0];
    asignacion.fecha_check_in = hoy;
    console.log(`Check-In registrado para ${asignacion.nombre_estudiante} el ${hoy}`);
    // Aquí iría tu HTTP PATCH a tu backend
  }

  prepararAccion(tipo: 'CHECKOUT' | 'RENUNCIA', asignacion: Asignacion): void {
    this.accionPendiente = { tipo, asignacion };
    this.isConfirmModalOpen = true;
  }

  ejecutarAccionPendiente(): void {
    if (!this.accionPendiente) return;
    
    const { tipo, asignacion } = this.accionPendiente;
    const hoy = new Date().toISOString().split('T')[0];

    if (tipo === 'CHECKOUT') {
      asignacion.estado = 'Finalizada';
      asignacion.fecha_check_out = hoy;
      console.log(`Check-Out (Finalización) registrado para ${asignacion.nombre_estudiante}`);
    } else if (tipo === 'RENUNCIA') {
      asignacion.estado = 'Renunciada';
      if (!asignacion.fecha_check_out) {
        asignacion.fecha_check_out = hoy; // Registramos cuándo renunció
      }
      console.log(`Renuncia registrada para ${asignacion.nombre_estudiante}`);
    }

    // Aquí iría tu HTTP PATCH
    this.cerrarModal();
    this.aplicarFiltros();
  }

  cerrarModal(): void {
    this.isConfirmModalOpen = false;
    this.accionPendiente = null;
  }

  // --- UTILIDADES UI ---
  
  getClassForEstado(estado: string): string {
    switch(estado) {
      case 'Activa': return 'act';
      case 'Finalizada': return 'fin';
      case 'Renunciada': return 'ren';
      default: return '';
    }
  }
}