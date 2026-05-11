import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
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
      id_incidencia: 1,
      descripcion: 'Fuga de agua importante en el lavamanos del baño, el piso se está inundando rápidamente y necesitamos que venga alguien pronto a cortar el paso de agua.',
      estado: EstadoIncidencia.PENDIENTE, 
      fecha: '2026-04-20',
      gravedad: GravedadIncidencia.MODERADO, 
      id_habitacion: 10,
      nro_habitacion: 101,
      nombre_edificio: 'Residencia Masculina',
      rut_estudiante: '21.345.678-9',
      nombre_estudiante: 'Juan Pérez',
      periodo: '2026-1',
      rut_admin: null // Nadie la ha tomado aún
    },
    {
      id_incidencia: 2,
      descripcion: 'Ampolleta quemada en el escritorio.',
      estado: EstadoIncidencia.RESUELTA,
      fecha: '2026-04-15',
      gravedad: GravedadIncidencia.LEVE,
      id_habitacion: 25,
      nro_habitacion: 205,
      nombre_edificio: 'Residencia Femenina',
      rut_estudiante: '20.123.456-7',
      nombre_estudiante: 'María González',
      periodo: '2026-1',
      rut_admin: '11.222.333-4', 
      nombre_admin: 'Admin Mantenimiento'
    },
    {
      id_incidencia: 3,
      descripcion: 'Cortocircuito en el enchufe principal.',
      estado: EstadoIncidencia.EN_PROCESO,
      fecha: '2026-04-26',
      gravedad: GravedadIncidencia.GRAVE,
      id_habitacion: 30,
      nro_habitacion: 310,
      nombre_edificio: 'Residencia Masculina',
      rut_estudiante: '19.876.543-2',
      nombre_estudiante: 'Carlos Silva',
      periodo: '2026-1',
      rut_admin: '12.888.777-6',
      nombre_admin: 'Admin Noche'
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

  ngOnInit(): void {
    this.incidenciasFiltradas = [...this.incidencias];
    this.filtroPeriodo = '2026-1';
    this.aplicarFiltros();
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
      const matchRut = rutBuscado ? inc.rut_estudiante.toLowerCase().includes(rutBuscado) : true;
      
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
      this.selectedIncident.rut_admin = this.RUT_ADMIN_ACTUAL;
      this.selectedIncident.nombre_admin = this.NOMBRE_ADMIN_ACTUAL;
      this.aplicarFiltros(); 
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
      
      this.selectedIncident.rut_admin = this.RUT_ADMIN_ACTUAL;
      this.selectedIncident.nombre_admin = this.NOMBRE_ADMIN_ACTUAL;

      this.aplicarFiltros();
      this.closeModal();
      console.log(`Incidencia ${this.selectedIncident.id_incidencia} resuelta por ${this.NOMBRE_ADMIN_ACTUAL}`);
    }
  }
}