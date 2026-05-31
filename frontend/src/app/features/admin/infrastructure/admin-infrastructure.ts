import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EdificioDTO, PisoDTO, HabitacionDTO, Genero} from '../../../shared/models';

type ModalType = 'EDIFICIO' | 'PISO' | 'HABITACION' | 'DELETE' | null;
type ModalMode = 'CREATE' | 'EDIT';

@Component({
  selector: 'app-admin-infrastructure',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-infrastructure.html',
  styleUrl: './admin-infrastructure.scss'
})
export class AdminInfrastructureComponent {
  edificios: EdificioDTO[] = [
    {
      idEdificio: 1,
      nombre: 'Residencia Norte',
      ubicacion: 'Campus Central - Ala Norte',
      genero: Genero.MIXTO,
      pisos: [
        {
          idPiso: 10,
          nroPiso: 1,
          nombre: 'Planta Baja',
          idEdificio: 1,
          habitaciones: [
            { idHabitacion: 100, nroHabitacion: 101, capacidadActual: 2, capacidadTotal: 2, disponibilidad: true, idPiso: 10 },
            { idHabitacion: 101, nroHabitacion: 102, capacidadActual: 1, capacidadTotal: 4, disponibilidad: true, idPiso: 10 }
          ]
        },
        {
          idPiso: 11,
          nroPiso: 2,
          nombre: 'Primer Piso',
          idEdificio: 1,
          habitaciones: [
            { idHabitacion: 102, nroHabitacion: 201, capacidadActual: 0, capacidadTotal: 2, disponibilidad: false, idPiso: 11 }
          ]
        }
      ]
    },
    {
      idEdificio: 2,
      nombre: 'Pabellón Sur',
      ubicacion: 'Campus Central - Ala Sur',
      genero: Genero.FEMENINO,
      pisos: []
    }
  ];

  edificioSeleccionado: EdificioDTO | null = this.edificios[0];

  activeModal: ModalType = null;
  modalMode: ModalMode = 'CREATE';
  
  targetIdPiso: number | null = null;
  targetIdHabitacion: number | null = null;

  // Solo permitimos borrar pisos y habitaciones
  itemToDelete: { type: 'PISO' | 'HABITACION', data: any, parentData?: any } | null = null;

  edificioForm = { idEdificio: 0, nombre: '', ubicacion: '', genero: Genero.MIXTO };
  pisoForm = { idPiso: 0, nroPiso: 1, nombre: '' };
  habitacionForm = { idHabitacion: 0, nroHabitacion: 1, capacidadActual: 0, capacidadTotal: 1 };

  seleccionarEdificio(edificio: EdificioDTO): void {
    this.edificioSeleccionado = edificio;
  }

  cerrarModal(): void {
    this.activeModal = null;
  }

  // --- LÓGICA DE EDIFICIOS (Solo Edición) ---
  abrirModalEdificio(edificio: EdificioDTO): void {
    this.activeModal = 'EDIFICIO';
    this.edificioForm = { ...edificio };
  }

  guardarEdificio(): void {
    const idx = this.edificios.findIndex(e => e.idEdificio === this.edificioForm.idEdificio);
    if (idx !== -1) {
      this.edificios[idx].nombre = this.edificioForm.nombre;
      this.edificios[idx].ubicacion = this.edificioForm.ubicacion;
      this.edificios[idx].genero = this.edificioForm.genero;
    }
    this.cerrarModal();
  }

  // --- LÓGICA DE PISOS ---
  abrirModalPiso(mode: ModalMode, piso?: PisoDTO): void {
    this.modalMode = mode;
    this.activeModal = 'PISO';
    if (mode === 'EDIT' && piso) {
      this.pisoForm = { idPiso: piso.idPiso, nroPiso: piso.nroPiso, nombre: piso.nombre };
      this.targetIdPiso = piso.idPiso;
    } else {
      // Usamos safe navigation operator y fallback a 1 si no hay pisos
      const nextNro = (this.edificioSeleccionado?.pisos && this.edificioSeleccionado.pisos.length > 0) 
        ? Math.max(...this.edificioSeleccionado.pisos.map(p => p.nroPiso)) + 1 
        : 1;
      this.pisoForm = { idPiso: Date.now(), nroPiso: nextNro, nombre: `Piso ${nextNro}` };
    }
  }

  guardarPiso(): void {
    if (!this.edificioSeleccionado) return;

    if (!this.edificioSeleccionado.pisos) {
      this.edificioSeleccionado.pisos = [];
    }

    if (this.modalMode === 'CREATE') {
      this.edificioSeleccionado.pisos.push({
        idPiso: this.pisoForm.idPiso,
        nroPiso: this.pisoForm.nroPiso,
        nombre: this.pisoForm.nombre,
        idEdificio: this.edificioSeleccionado.idEdificio,
        habitaciones: []
      });
      this.edificioSeleccionado.pisos.sort((a, b) => a.nroPiso - b.nroPiso);
    } else {
      const piso = this.edificioSeleccionado.pisos.find(p => p.idPiso === this.targetIdPiso);
      if (piso) {
        piso.nroPiso = this.pisoForm.nroPiso;
        piso.nombre = this.pisoForm.nombre;
      }
    }
    this.cerrarModal();
  }

  // --- LÓGICA DE HABITACIONES ---
  abrirModalHabitacion(mode: ModalMode, piso: PisoDTO, habitacion?: HabitacionDTO): void {
    this.modalMode = mode;
    this.activeModal = 'HABITACION';
    this.targetIdPiso = piso.idPiso;

    if (mode === 'EDIT' && habitacion) {
      this.habitacionForm = { 
        idHabitacion: habitacion.idHabitacion, 
        nroHabitacion: habitacion.nroHabitacion, 
        capacidadActual: habitacion.capacidadActual,
        capacidadTotal: habitacion.capacidadTotal || 1 // Fallback de seguridad
      };
      this.targetIdHabitacion = habitacion.idHabitacion;
    } else {
      this.habitacionForm = { idHabitacion: Date.now(), nroHabitacion: 0, capacidadActual: 0, capacidadTotal: 2 };
    }
  }

  guardarHabitacion(): void {
    if (!this.edificioSeleccionado || !this.edificioSeleccionado.pisos || this.targetIdPiso === null) return;
    const piso = this.edificioSeleccionado.pisos.find(p => p.idPiso === this.targetIdPiso);
    if (!piso) return;

    if (!piso.habitaciones) {
      piso.habitaciones = [];
    }

    if (this.modalMode === 'CREATE') {
      piso.habitaciones.push({
        idHabitacion: this.habitacionForm.idHabitacion,
        nroHabitacion: this.habitacionForm.nroHabitacion,
        capacidadActual: 0, 
        capacidadTotal: this.habitacionForm.capacidadTotal,
        disponibilidad: true,
        idPiso: piso.idPiso
      });
    } else {
      const hab = piso.habitaciones.find(h => h.idHabitacion === this.targetIdHabitacion);
      if (hab) {
        hab.nroHabitacion = this.habitacionForm.nroHabitacion;
        hab.capacidadActual = this.habitacionForm.capacidadActual;
        hab.capacidadTotal = this.habitacionForm.capacidadTotal;
      }
    }
    this.cerrarModal();
  }

  toggleDisponibilidad(habitacion: HabitacionDTO): void {
    habitacion.disponibilidad = !habitacion.disponibilidad;
  }

  // Solo acepta PISO o HABITACION para eliminar
  confirmarEliminacion(type: 'PISO' | 'HABITACION', data: any, parentData?: any): void {
    this.itemToDelete = { type, data, parentData };
    this.activeModal = 'DELETE';
  }

  ejecutarEliminacion(): void {
    if (!this.itemToDelete) return;
    const { type, data, parentData } = this.itemToDelete;

    if (type === 'PISO') {
      if (this.edificioSeleccionado && this.edificioSeleccionado.pisos) {
        this.edificioSeleccionado.pisos = this.edificioSeleccionado.pisos.filter(p => p.idPiso !== data.idPiso);
      }
    } else if (type === 'HABITACION') {
      const piso = parentData as PisoDTO;
      if (piso && piso.habitaciones) {
        piso.habitaciones = piso.habitaciones.filter(h => h.idHabitacion !== data.idHabitacion);
      }
    }
    this.cerrarModal();
  }
}