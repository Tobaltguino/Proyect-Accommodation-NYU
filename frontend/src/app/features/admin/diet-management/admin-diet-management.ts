import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DietaDTO, TipoDieta } from '../../../shared/models';

@Component({
  selector: 'app-admin-diet-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-diet-management.html',
  styleUrl: './admin-diet-management.scss'
})
export class AdminDietManagementComponent implements OnInit {
  public TipoDietaEnum = TipoDieta;

  planes: DietaDTO[] = [
    {
      id_plan: 1,
      tipo_plan: TipoDieta.SIN_PREFERENCIA,
      id_periodo: 1,
      nombre_estudiante: 'Valentina Soto',
      rut_estudiante: '21.345.678-9',
      nombre_periodo: '2026-1'
    },
    {
      id_plan: 2,
      tipo_plan: TipoDieta.VEGANO,
      id_periodo: 1,
      nombre_estudiante: 'Matías Fernández',
      rut_estudiante: '20.123.456-7',
      nombre_periodo: '2026-1'
    },
    {
      id_plan: 3,
      tipo_plan: TipoDieta.PECETARIANO, 
      id_periodo: 1,
      nombre_estudiante: 'Camila Rojas',
      rut_estudiante: '19.876.543-2',
      nombre_periodo: '2026-1'
    },
    {
      id_plan: 4,
      tipo_plan: TipoDieta.VEGETARIANO,
      id_periodo: 2,
      nombre_estudiante: 'Sebastián Morales',
      rut_estudiante: '22.111.222-3',
      nombre_periodo: '2025-2'
    }
  ];

  planesFiltrados: DietaDTO[] = [];

  // Filtros
  filtroPeriodo: string = '';
  filtroTipo: TipoDieta | '' = '';
  filtroBusqueda: string = '';
  periodos: string[] = ['2026-1', '2025-2'];

  // Variables de Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 20;

  // Control del Modal
  isModalOpen = false;
  planSeleccionado: DietaDTO | null = null;
  nuevoTipoPlan: TipoDieta = TipoDieta.SIN_PREFERENCIA;

  ngOnInit(): void {
    this.planesFiltrados = [...this.planes];
    this.filtroPeriodo = '2026-1';
    this.aplicarFiltros();
  }

  // Getters de Paginación
  get planesPaginados(): DietaDTO[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.planesFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.planesFiltrados.length / this.itemsPorPagina) || 1;
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  aplicarFiltros(): void {
    const busqueda = this.filtroBusqueda.toLowerCase();
    
    this.planesFiltrados = this.planes.filter(plan => {
      const matchPeriodo = this.filtroPeriodo ? plan.nombre_periodo === this.filtroPeriodo : true;
      const matchTipo = this.filtroTipo ? plan.tipo_plan === this.filtroTipo : true;
      
      const matchBusqueda = busqueda ? 
        ((plan.nombre_estudiante || '').toLowerCase().includes(busqueda) || 
         (plan.rut_estudiante || '').toLowerCase().includes(busqueda)) : true;
      
      return matchPeriodo && matchTipo && matchBusqueda;
    });

    // Reiniciamos la página al filtrar
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroPeriodo = '';
    this.filtroTipo = '';
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  abrirModal(plan: DietaDTO): void {
    this.planSeleccionado = plan;
    this.nuevoTipoPlan = plan.tipo_plan as TipoDieta; 
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.planSeleccionado = null;
  }

  guardarCambios(): void {
    if (this.planSeleccionado) {
      this.planSeleccionado.tipo_plan = this.nuevoTipoPlan;
      console.log(`Dieta actualizada para ${this.planSeleccionado.nombre_estudiante}: ${this.nuevoTipoPlan}`);
      
      this.aplicarFiltros();
      this.cerrarModal();
    }
  }

  // Clases dinámicas
  getClassForDieta(tipo: string): string {
    switch(tipo) {
      case TipoDieta.VEGANO: return 'bg-success text-white';
      case TipoDieta.VEGETARIANO: return 'bg-teal text-white'; 
      case TipoDieta.PECETARIANO: return 'bg-info text-dark'; 
      case TipoDieta.SIN_PREFERENCIA: return 'bg-secondary text-white';
      default: return 'bg-light text-dark';
    }
  }
}