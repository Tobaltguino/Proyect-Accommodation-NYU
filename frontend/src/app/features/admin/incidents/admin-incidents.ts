import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type EstadoIncidencia = 'Pendiente' | 'En Proceso' | 'Resuelta' | '';
export type GravedadIncidencia = 'Leve' | 'Moderado' | 'Grave' | '';

export interface Incidencia {
  id_incidencia: number;
  descripcion: string;
  estado: EstadoIncidencia;
  fecha: string;
  gravedad: GravedadIncidencia;
  nro_habitacion: number;
  nombre_edificio: string;
  rut_usuario: string;
  nombre_usuario: string;
  periodo: string;
}

@Component({
  selector: 'app-admin-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-incidents.html',
  styleUrl: './admin-incidents.scss'
})
export class AdminIncidentsComponent implements OnInit {
  incidencias: Incidencia[] = [
    {
      id_incidencia: 1,
      descripcion: 'Fuga de agua importante en el lavamanos del baño, el piso se está inundando rápidamente y necesitamos que venga alguien pronto a cortar el paso de agua.',
      estado: 'Pendiente',
      fecha: '2026-04-20',
      gravedad: 'Moderado',
      nro_habitacion: 101,
      nombre_edificio: 'Residencia Masculina',
      rut_usuario: '21.345.678-9',
      nombre_usuario: 'Juan Pérez',
      periodo: '2026-1'
    },
    {
      id_incidencia: 2,
      descripcion: 'Ampolleta quemada en el escritorio.',
      estado: 'Resuelta',
      fecha: '2026-04-15',
      gravedad: 'Leve',
      nro_habitacion: 205,
      nombre_edificio: 'Residencia Femenina',
      rut_usuario: '20.123.456-7',
      nombre_usuario: 'María González',
      periodo: '2026-1'
    },
    {
      id_incidencia: 3,
      descripcion: 'Cortocircuito en el enchufe principal, salió humo y ahora no hay electricidad en toda la mitad de la habitación.',
      estado: 'En Proceso',
      fecha: '2026-04-26',
      gravedad: 'Grave',
      nro_habitacion: 310,
      nombre_edificio: 'Residencia Masculina',
      rut_usuario: '19.876.543-2',
      nombre_usuario: 'Carlos Silva',
      periodo: '2026-1'
    }
  ];

  incidenciasFiltradas: Incidencia[] = [];

  filtroPeriodo: string = '';
  filtroEstado: EstadoIncidencia = '';
  filtroGravedad: GravedadIncidencia = '';
  filtroRut: string = ''; // <-- Nueva variable para el RUT

  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  isModalOpen = false;
  selectedIncident: Incidencia | null = null;

  ngOnInit(): void {
    this.incidenciasFiltradas = [...this.incidencias];
    this.filtroPeriodo = '2026-1';
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const rutBuscado = this.filtroRut.trim().toLowerCase();

    this.incidenciasFiltradas = this.incidencias.filter(inc => {
      const matchPeriodo = this.filtroPeriodo ? inc.periodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? inc.estado === this.filtroEstado : true;
      const matchGravedad = this.filtroGravedad ? inc.gravedad === this.filtroGravedad : true;
      const matchRut = rutBuscado ? inc.rut_usuario.toLowerCase().includes(rutBuscado) : true;
      
      return matchPeriodo && matchEstado && matchGravedad && matchRut;
    });
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroEstado = '';
    this.filtroGravedad = '';
    this.filtroRut = ''; // <-- Limpiamos también el RUT
    this.aplicarFiltros();
  }

  cambiarEstado(incidencia: Incidencia, nuevoEstado: EstadoIncidencia): void {
    incidencia.estado = nuevoEstado;
    this.aplicarFiltros(); 
  }

  openModal(incidencia: Incidencia): void {
    this.selectedIncident = incidencia;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden'; 
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedIncident = null;
    document.body.style.overflow = 'auto'; 
  }
}