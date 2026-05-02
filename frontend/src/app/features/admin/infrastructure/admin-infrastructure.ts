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
      id_edificio: 1,
      nombre: 'Residencia Norte',
      ubicacion: 'Campus Central - Ala Norte',
      genero: Genero.MIXTO,
      pisos: [
        {
          id_piso: 10,
          nro_piso: 1,
          nombre: 'Planta Baja',
          id_edificio: 1,
          habitaciones: [
            { id_habitacion: 100, nro_habitacion: 101, capacidad_actual: 2, capacidad_total: 2, disponibilidad: true, id_piso: 10 },
            { id_habitacion: 101, nro_habitacion: 102, capacidad_actual: 1, capacidad_total: 4, disponibilidad: true, id_piso: 10 }
          ]
        },
        {
          id_piso: 11,
          nro_piso: 2,
          nombre: 'Primer Piso',
          id_edificio: 1,
          habitaciones: [
            { id_habitacion: 102, nro_habitacion: 201, capacidad_actual: 0, capacidad_total: 2, disponibilidad: false, id_piso: 11 }
          ]
        }
      ]
    },
    {
      id_edificio: 2,
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
  itemToDelete: { type: 'EDIFICIO' | 'PISO' | 'HABITACION', data: any, parentData?: any } | null = null;

  edificioForm = { id_edificio: 0, nombre: '', ubicacion: '', genero: Genero.MIXTO };
  pisoForm = { id_piso: 0, nro_piso: 1, nombre: '' };
  habitacionForm = { id_habitacion: 0, nro_habitacion: 1, capacidad_actual: 0, capacidad_total: 1 };

  seleccionarEdificio(edificio: EdificioDTO): void {
    this.edificioSeleccionado = edificio;
  }

  cerrarModal(): void {
    this.activeModal = null;
  }

  // --- LÓGICA DE EDIFICIOS ---
  abrirModalEdificio(mode: ModalMode, edificio?: EdificioDTO): void {
    this.modalMode = mode;
    this.activeModal = 'EDIFICIO';
    if (mode === 'EDIT' && edificio) {
      this.edificioForm = { ...edificio };
    } else {
      this.edificioForm = { id_edificio: Date.now(), nombre: '', ubicacion: '', genero: Genero.MIXTO };
    }
  }

  guardarEdificio(): void {
    if (this.modalMode === 'CREATE') {
      this.edificios.push({ ...this.edificioForm, pisos: [] });
      this.edificioSeleccionado = this.edificios[this.edificios.length - 1];
    } else {
      const idx = this.edificios.findIndex(e => e.id_edificio === this.edificioForm.id_edificio);
      if (idx !== -1) {
        this.edificios[idx].nombre = this.edificioForm.nombre;
        this.edificios[idx].ubicacion = this.edificioForm.ubicacion;
        this.edificios[idx].genero = this.edificioForm.genero;
      }
    }
    this.cerrarModal();
  }

  // --- LÓGICA DE PISOS ---
  abrirModalPiso(mode: ModalMode, piso?: PisoDTO): void {
    this.modalMode = mode;
    this.activeModal = 'PISO';
    if (mode === 'EDIT' && piso) {
      this.pisoForm = { id_piso: piso.id_piso, nro_piso: piso.nro_piso, nombre: piso.nombre };
      this.targetIdPiso = piso.id_piso;
    } else {
      const nextNro = this.edificioSeleccionado?.pisos.length ? Math.max(...this.edificioSeleccionado.pisos.map(p => p.nro_piso)) + 1 : 1;
      this.pisoForm = { id_piso: Date.now(), nro_piso: nextNro, nombre: `Piso ${nextNro}` };
    }
  }

  guardarPiso(): void {
    if (!this.edificioSeleccionado) return;

    if (this.modalMode === 'CREATE') {
      this.edificioSeleccionado.pisos.push({
        id_piso: this.pisoForm.id_piso,
        nro_piso: this.pisoForm.nro_piso,
        nombre: this.pisoForm.nombre,
        id_edificio: this.edificioSeleccionado.id_edificio,
        habitaciones: []
      });
      this.edificioSeleccionado.pisos.sort((a, b) => a.nro_piso - b.nro_piso);
    } else {
      const piso = this.edificioSeleccionado.pisos.find(p => p.id_piso === this.targetIdPiso);
      if (piso) {
        piso.nro_piso = this.pisoForm.nro_piso;
        piso.nombre = this.pisoForm.nombre;
      }
    }
    this.cerrarModal();
  }

  // --- LÓGICA DE HABITACIONES ---
  abrirModalHabitacion(mode: ModalMode, piso: PisoDTO, habitacion?: HabitacionDTO): void {
    this.modalMode = mode;
    this.activeModal = 'HABITACION';
    this.targetIdPiso = piso.id_piso;

    if (mode === 'EDIT' && habitacion) {
      this.habitacionForm = { 
        id_habitacion: habitacion.id_habitacion, 
        nro_habitacion: habitacion.nro_habitacion, 
        capacidad_actual: habitacion.capacidad_actual,
        capacidad_total: habitacion.capacidad_total
      };
      this.targetIdHabitacion = habitacion.id_habitacion;
    } else {
      this.habitacionForm = { id_habitacion: Date.now(), nro_habitacion: 0, capacidad_actual: 0, capacidad_total: 2 };
    }
  }

  guardarHabitacion(): void {
    if (!this.edificioSeleccionado || this.targetIdPiso === null) return;
    const piso = this.edificioSeleccionado.pisos.find(p => p.id_piso === this.targetIdPiso);
    if (!piso) return;

    if (this.modalMode === 'CREATE') {
      piso.habitaciones.push({
        id_habitacion: this.habitacionForm.id_habitacion,
        nro_habitacion: this.habitacionForm.nro_habitacion,
        capacidad_actual: 0, 
        capacidad_total: this.habitacionForm.capacidad_total,
        disponibilidad: true,
        id_piso: piso.id_piso
      });
    } else {
      const hab = piso.habitaciones.find(h => h.id_habitacion === this.targetIdHabitacion);
      if (hab) {
        hab.nro_habitacion = this.habitacionForm.nro_habitacion;
        hab.capacidad_actual = this.habitacionForm.capacidad_actual;
        hab.capacidad_total = this.habitacionForm.capacidad_total;
      }
    }
    this.cerrarModal();
  }

  toggleDisponibilidad(habitacion: HabitacionDTO): void {
    habitacion.disponibilidad = !habitacion.disponibilidad;
  }

  confirmarEliminacion(type: 'EDIFICIO' | 'PISO' | 'HABITACION', data: any, parentData?: any): void {
    this.itemToDelete = { type, data, parentData };
    this.activeModal = 'DELETE';
  }

  ejecutarEliminacion(): void {
    if (!this.itemToDelete) return;
    const { type, data, parentData } = this.itemToDelete;

    if (type === 'EDIFICIO') {
      this.edificios = this.edificios.filter(e => e.id_edificio !== data.id_edificio);
      if (this.edificioSeleccionado?.id_edificio === data.id_edificio) {
        this.edificioSeleccionado = this.edificios.length > 0 ? this.edificios[0] : null;
      }
    } else if (type === 'PISO') {
      if (this.edificioSeleccionado) {
        this.edificioSeleccionado.pisos = this.edificioSeleccionado.pisos.filter(p => p.id_piso !== data.id_piso);
      }
    } else if (type === 'HABITACION') {
      const piso = parentData as PisoDTO;
      piso.habitaciones = piso.habitaciones.filter(h => h.id_habitacion !== data.id_habitacion);
    }
    this.cerrarModal();
  }
}