import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IncidenciaDTO, EstadoIncidencia, GravedadIncidencia} from '../../../shared/models';

@Component({
  selector: 'app-admin-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-incidents.html',
  styleUrl: './admin-incidents.scss'
})
export class AdminIncidentsComponent implements OnInit {
  incidencias: IncidenciaDTO[] = [
    {
      id_incidencia: 1,
      descripcion: 'Fuga de agua importante en el lavamanos del baño, el piso se está inundando rápidamente y necesitamos que venga alguien pronto a cortar el paso de agua.',
      estado: EstadoIncidencia.PENDIENTE,
      fecha: '2026-04-20',
      gravedad: GravedadIncidencia.MODERADO,
      nro_habitacion: 101,
      nombre_edificio: 'Residencia Masculina',
      rut_usuario: '21.345.678-9',
      nombre_usuario: 'Juan Pérez',
      periodo: '2026-1'
    },
    {
      id_incidencia: 2,
      descripcion: 'Ampolleta quemada en el escritorio.',
      estado: EstadoIncidencia.RESUELTA,
      fecha: '2026-04-15',
      gravedad: GravedadIncidencia.LEVE,
      nro_habitacion: 205,
      nombre_edificio: 'Residencia Femenina',
      rut_usuario: '20.123.456-7',
      nombre_usuario: 'María González',
      periodo: '2026-1'
    },
    {
      id_incidencia: 3,
      descripcion: 'Cortocircuito en el enchufe principal, salió humo y ahora no hay electricidad en toda la mitad de la habitación.',
      estado: EstadoIncidencia.EN_PROCESO,
      fecha: '2026-04-26',
      gravedad: GravedadIncidencia.GRAVE,
      nro_habitacion: 310,
      nombre_edificio: 'Residencia Masculina',
      rut_usuario: '19.876.543-2',
      nombre_usuario: 'Carlos Silva',
      periodo: '2026-1'
    }
  ];

  incidenciasFiltradas: IncidenciaDTO[] = [];

  filtroPeriodo: string = '';
  filtroEstado: EstadoIncidencia | '' = '';
  filtroGravedad: GravedadIncidencia | '' = '';
  filtroRut: string = '';

  periodos: string[] = ['2026-1', '2025-2', '2025-1'];

  isModalOpen = false;
  selectedIncident: IncidenciaDTO | null = null;

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
    this.filtroRut = '';
    this.aplicarFiltros();
  }

  cambiarEstado(incidencia: IncidenciaDTO, nuevoEstado: EstadoIncidencia): void {
    incidencia.estado = nuevoEstado;
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
}