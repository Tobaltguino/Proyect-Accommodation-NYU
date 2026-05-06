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
  styleUrl: './student-incidents.scss' // Asegúrate de copiar aquí el CSS del admin
})
export class StudentIncidentsComponent implements OnInit {
  // Exponemos los Enums a la vista HTML
  public EstadoEnum = EstadoIncidencia;
  public GravedadEnum = GravedadIncidencia;

  // Simulamos solo las incidencias de ESTE estudiante
  misIncidencias: IncidenciaDTO[] = [
    {
      id_incidencia: 101,
      descripcion: 'Fuga de agua en el lavamanos.',
      estado: EstadoIncidencia.PENDIENTE, 
      fecha: '2026-05-02',
      gravedad: GravedadIncidencia.MODERADO, 
      nro_habitacion: 204,
      nombre_edificio: 'Residencia Norte',
      rut_usuario: '12.345.678-9',
      nombre_usuario: 'Estudiante Demo',
      periodo: '2026-1'
    },
    {
      id_incidencia: 102,
      descripcion: 'Ampolleta principal quemada.',
      estado: EstadoIncidencia.RESUELTA,
      fecha: '2026-04-15',
      gravedad: GravedadIncidencia.LEVE,
      nro_habitacion: 204,
      nombre_edificio: 'Residencia Norte',
      rut_usuario: '12.345.678-9',
      nombre_usuario: 'Estudiante Demo',
      periodo: '2026-1'
    }
  ];

  incidenciasFiltradas: IncidenciaDTO[] = [];

  // Filtros (Sin RUT)
  filtroPeriodo: string = '';
  filtroEstado: EstadoIncidencia | '' = '';
  filtroGravedad: GravedadIncidencia | '' = '';
  periodos: string[] = ['2026-1', '2025-2'];

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

  aplicarFiltros(): void {
    this.incidenciasFiltradas = this.misIncidencias.filter(inc => {
      const matchPeriodo = this.filtroPeriodo ? inc.periodo === this.filtroPeriodo : true;
      const matchEstado = this.filtroEstado ? inc.estado === this.filtroEstado : true;
      const matchGravedad = this.filtroGravedad ? inc.gravedad === this.filtroGravedad : true;
      
      return matchPeriodo && matchEstado && matchGravedad;
    });
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

    // Aquí iría el llamado al backend con el servicio
    console.log('Enviando nueva incidencia:', this.nuevaIncidencia);
    
    // Simulamos que se agrega exitosamente
    alert('Reporte enviado con éxito.');
    this.closeCreateModal();
  }
}