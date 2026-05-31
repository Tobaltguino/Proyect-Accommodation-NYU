import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { EdificioDTO, PisoDTO, HabitacionDTO, Genero } from '../../../shared/models';
import { InfraestructuraService } from '../../../core/services/infraestructura.service';

type ModalType = 'EDIFICIO' | 'PISO' | 'HABITACION' | 'DELETE' | null;
type ModalMode = 'CREATE' | 'EDIT';

@Component({
  selector: 'app-admin-infrastructure',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-infrastructure.html',
  styleUrl: './admin-infrastructure.scss'
})
export class AdminInfrastructureComponent implements OnInit {
  private infraestructuraService = inject(InfraestructuraService);
  private cdr = inject(ChangeDetectorRef); // 👈 Inyectamos el detector de cambios

  edificios: EdificioDTO[] = [];
  edificioSeleccionado: EdificioDTO | null = null;

  activeModal: ModalType = null;
  modalMode: ModalMode = 'CREATE';
  
  targetIdPiso: number | null = null;
  targetIdHabitacion: number | null = null;
  itemToDelete: { type: 'PISO' | 'HABITACION', data: any, parentData?: any } | null = null;

  edificioForm = { idEdificio: 0, nombre: '', ubicacion: '', genero: Genero.MIXTO };
  pisoForm = { idPiso: 0, nroPiso: 1, nombre: '' };
  habitacionForm = { idHabitacion: 0, nroHabitacion: 1, capacidadActual: 0, capacidadTotal: 1 };

  ngOnInit(): void {
    this.cargarEdificios();
  }

  // --- LÓGICA DE CARGA DE DATOS ---
  cargarEdificios(): void {
    this.infraestructuraService.obtenerTodosLosEdificios().subscribe({
      next: (data) => {
        this.edificios = data;
        this.cdr.detectChanges(); // 👈 Obligamos a Angular a dibujar la barra lateral

        if (this.edificios.length > 0) {
          // 1. Si ya estábamos viendo un edificio
          if (this.edificioSeleccionado) {
            const actualizado = this.edificios.find(e => e.idEdificio === this.edificioSeleccionado!.idEdificio);
            if (actualizado) {
              this.seleccionarEdificio(actualizado);
              return;
            }
          }
          
          // 2. Si venimos de otra pestaña o se recargó la página (F5)
          const idGuardado = localStorage.getItem('id_edificio_actual');
          if (idGuardado) {
            const guardado = this.edificios.find(e => e.idEdificio === Number(idGuardado));
            if (guardado) {
              this.seleccionarEdificio(guardado);
              return;
            }
          }

          // 3. Por defecto, seleccionamos el primero si no hay historial
          this.seleccionarEdificio(this.edificios[0]);
        }
      },
      error: (err) => console.error('Error al cargar edificios:', err)
    });
  }

  seleccionarEdificio(edificio: EdificioDTO): void {
    this.edificioSeleccionado = edificio;
    localStorage.setItem('id_edificio_actual', edificio.idEdificio.toString());
    this.cargarDetallesEdificio(edificio.idEdificio);
  }

  cargarDetallesEdificio(idEdificio: number): void {
    forkJoin({
      pisos: this.infraestructuraService.obtenerPisosPorEdificio(idEdificio),
      habitaciones: this.infraestructuraService.obtenerHabitacionesPorEdificio(idEdificio)
    }).subscribe({
      next: ({ pisos, habitaciones }) => {
        if (this.edificioSeleccionado && this.edificioSeleccionado.idEdificio === idEdificio) {
          
          // 1. Ordenamos los pisos de menor a mayor (Piso 1, Piso 2...)
          const pisosOrdenados = pisos.sort((a, b) => a.nroPiso - b.nroPiso);

          this.edificioSeleccionado = {
            ...this.edificioSeleccionado,
            pisos: pisosOrdenados.map(piso => {
              
              // 2. Filtramos las habitaciones de este piso específico
              const habitacionesDelPiso = habitaciones.filter(h => h.idPiso === piso.idPiso);
              
              // 3. Ordenamos esas habitaciones de menor a mayor (Hab 101, Hab 102...)
              const habitacionesOrdenadas = habitacionesDelPiso.sort((a, b) => a.nroHabitacion - b.nroHabitacion);

              return {
                ...piso,
                habitaciones: habitacionesOrdenadas
              };
            })
          };
          
          this.cdr.detectChanges(); 
        }
      },
      error: (err) => console.error('Error al cargar los detalles del edificio:', err)
    });
  }

  cerrarModal(): void {
    this.activeModal = null;
    this.cdr.detectChanges(); // Previene tirones gráficos al cerrar modales
  }

  // --- LÓGICA DE EDIFICIOS ---
  abrirModalEdificio(edificio: EdificioDTO): void {
    this.activeModal = 'EDIFICIO';
    this.edificioForm = { ...edificio };
  }

  guardarEdificio(): void {
    const { idEdificio, nombre, ubicacion, genero } = this.edificioForm;
    this.infraestructuraService.modificarEdificio(idEdificio, { nombre, ubicacion, genero }).subscribe({
      next: () => {
        this.cargarEdificios();
        this.cerrarModal();
      },
      error: (err) => console.error('Error al modificar edificio', err)
    });
  }

  // --- LÓGICA DE PISOS ---
  abrirModalPiso(mode: ModalMode, piso?: PisoDTO): void {
    this.modalMode = mode;
    this.activeModal = 'PISO';
    if (mode === 'EDIT' && piso) {
      this.pisoForm = { idPiso: piso.idPiso, nroPiso: piso.nroPiso, nombre: piso.nombre };
      this.targetIdPiso = piso.idPiso;
    } else {
      const nextNro = (this.edificioSeleccionado?.pisos && this.edificioSeleccionado.pisos.length > 0) 
        ? Math.max(...this.edificioSeleccionado.pisos.map(p => p.nroPiso)) + 1 
        : 1;
      this.pisoForm = { idPiso: 0, nroPiso: nextNro, nombre: `Piso ${nextNro}` };
    }
  }

  guardarPiso(): void {
    if (!this.edificioSeleccionado) return;

    if (this.modalMode === 'CREATE') {
      this.infraestructuraService.crearPiso(this.pisoForm.nroPiso, this.pisoForm.nombre, this.edificioSeleccionado.idEdificio).subscribe({
        next: () => {
          this.cargarDetallesEdificio(this.edificioSeleccionado!.idEdificio);
          this.cerrarModal();
        },
        error: (err) => console.error('Error al crear piso', err)
      });
    } else {
      this.infraestructuraService.modificarPiso(this.targetIdPiso!, { nroPiso: this.pisoForm.nroPiso, nombre: this.pisoForm.nombre }).subscribe({
        next: () => {
          this.cargarDetallesEdificio(this.edificioSeleccionado!.idEdificio);
          this.cerrarModal();
        },
        error: (err) => console.error('Error al modificar piso', err)
      });
    }
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
        capacidadTotal: habitacion.capacidadTotal || 1 
      };
      this.targetIdHabitacion = habitacion.idHabitacion;
    } else {
      this.habitacionForm = { idHabitacion: 0, nroHabitacion: 0, capacidadActual: 0, capacidadTotal: 2 };
    }
  }

  guardarHabitacion(): void {
    if (this.modalMode === 'CREATE') {
      this.infraestructuraService.crearHabitacion(this.habitacionForm.nroHabitacion, this.habitacionForm.capacidadActual, true, this.targetIdPiso!).subscribe({
        next: () => {
          this.cargarDetallesEdificio(this.edificioSeleccionado!.idEdificio);
          this.cerrarModal();
        },
        error: (err) => console.error('Error al crear habitación', err)
      });
    } else {
      this.infraestructuraService.modificarHabitacion(this.targetIdHabitacion!, {
        nroHabitacion: this.habitacionForm.nroHabitacion,
        capacidadActual: this.habitacionForm.capacidadActual
      }).subscribe({
        next: () => {
          this.cargarDetallesEdificio(this.edificioSeleccionado!.idEdificio);
          this.cerrarModal();
        },
        error: (err) => console.error('Error al modificar habitación', err)
      });
    }
  }

  toggleDisponibilidad(habitacion: HabitacionDTO): void {
    const nuevoEstado = !habitacion.disponibilidad;
    this.infraestructuraService.modificarHabitacion(habitacion.idHabitacion, { disponibilidad: nuevoEstado }).subscribe({
      next: () => {
        habitacion.disponibilidad = nuevoEstado;
        this.cdr.detectChanges(); // 👈 Actualizamos la vista local del candado
      },
      error: (err) => console.error('Error al cambiar disponibilidad', err)
    });
  }

  // --- LÓGICA DE ELIMINACIÓN ---
  confirmarEliminacion(type: 'PISO' | 'HABITACION', data: any, parentData?: any): void {
    this.itemToDelete = { type, data, parentData };
    this.activeModal = 'DELETE';
  }

  ejecutarEliminacion(): void {
    if (!this.itemToDelete || !this.edificioSeleccionado) return;
    const { type, data } = this.itemToDelete;

    if (type === 'PISO') {
      this.infraestructuraService.eliminarPiso(data.idPiso).subscribe({
        next: () => {
          this.cargarDetallesEdificio(this.edificioSeleccionado!.idEdificio);
          this.cerrarModal();
        },
        error: (err) => console.error('Error al eliminar piso', err)
      });
    } else if (type === 'HABITACION') {
      this.infraestructuraService.eliminarHabitacion(data.idHabitacion).subscribe({
        next: () => {
          this.cargarDetallesEdificio(this.edificioSeleccionado!.idEdificio);
          this.cerrarModal();
        },
        error: (err) => console.error('Error al eliminar habitación', err)
      });
    }
  }
}