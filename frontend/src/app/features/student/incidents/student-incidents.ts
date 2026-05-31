import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IncidenciaDTO, 
  EstadoIncidencia, 
  GravedadIncidencia 
} from '../../../shared/models';

@Component({
  selector: 'app-student-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-incidents.html',
  styleUrl: './student-incidents.scss'
})
export class StudentIncidentsComponent implements OnInit {
  // Exponemos los Enums a la vista HTML
  public EstadoEnum = EstadoIncidencia;
  public GravedadEnum = GravedadIncidencia;

  // Simulamos solo las incidencias de ESTE estudiante
  misIncidencias: IncidenciaDTO[] = [
    {
      idIncidencia: 101,
      descripcion: 'Fuga de agua en el lavamanos.',
      estado: EstadoIncidencia.PENDIENTE, 
      fecha: '2026-05-02',
      gravedad: GravedadIncidencia.MODERADO,
      idHabitacion: 20, 
      nroHabitacion: 204,
      nombreEdificio: 'Residencia Norte',
      rutEstudiante: '12.345.678-9', 
      nombreEstudiante: 'Estudiante Demo', 
      periodo: '2026-1',
      rutAdmin: null 
    },
    {
      idIncidencia: 102,
      descripcion: 'Ampolleta principal quemada.',
      estado: EstadoIncidencia.RESUELTA,
      fecha: '2026-04-15',
      gravedad: GravedadIncidencia.LEVE,
      idHabitacion: 20, 
      nroHabitacion: 204,
      nombreEdificio: 'Residencia Norte',
      rutEstudiante: '12.345.678-9', 
      nombreEstudiante: 'Estudiante Demo', 
      periodo: '2026-1',
      rutAdmin: '11.222.333-4', 
      nombreAdmin: 'Admin Mantenimiento'
    }
  ];

  incidenciasFiltradas: IncidenciaDTO[] = [];

  // Filtros
  filtroPeriodo: string = '';
  filtroEstado: EstadoIncidencia | '' = '';
  filtroGravedad: GravedadIncidencia | '' = '';
  periodos: string[] = ['2026-1', '2025-2'];

  // Variables de Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 20;

  // Variables para Modal de Visualización
  isViewModalOpen = false;
  selectedIncident: IncidenciaDTO | null = null; 

  // Variables para Modal de Creación
  isCreateModalOpen = false;
  nuevaIncidencia = {
    descripcion: '',
    gravedad: GravedadIncidencia.LEVE
  };

  ngOnInit(): void {
    this.incidenciasFiltradas = [...this.misIncidencias];
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
    this.incidenciasFiltradas = this.misIncidencias.filter(inc => {
      const matchPeriodo = this.filtroPeriodo ? inc.periodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? inc.estado === this.filtroEstado : true;
      const matchGravedad = this.filtroGravedad ? inc.gravedad === this.filtroGravedad : true;
      
      return matchPeriodo && matchEstado && matchGravedad;
    });

    // Reiniciar página al filtrar
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroEstado = '';
    this.filtroGravedad = '';
    this.aplicarFiltros();
  }

  // --- MÉTODOS MODAL VISUALIZAR ---
  openViewModal(incidencia: IncidenciaDTO): void {
    this.selectedIncident = incidencia;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedIncident = null;
  }

  // --- MÉTODOS MODAL CREAR ---
  openCreateModal(): void {
    this.nuevaIncidencia = { descripcion: '', gravedad: GravedadIncidencia.LEVE };
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  enviarReporte(): void {
    if (!this.nuevaIncidencia.descripcion.trim()) {
      alert('La descripción no puede estar vacía');
      return;
    }

    console.log('Enviando nueva incidencia:', this.nuevaIncidencia);
    
    alert('Reporte enviado con éxito.');
    this.closeCreateModal();
  }
}