import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EdificioDTO, PisoDTO, HabitacionDTO, Genero } from '../../../shared/models';
import { InfraestructuraService } from '../../../core/services/infraestructura.service';
import { ToastService } from '../../../core/toast/toast.service';

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
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

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

  cargarEdificios(): void {
    this.infraestructuraService.obtenerInfraestructuraCompleta().subscribe({
      next: (data) => {
        this.edificios = data;

        if (this.edificios.length > 0) {
          let seleccionado = false; 

          // Si ya estábamos viendo un edificio
          if (this.edificioSeleccionado) {
            const actualizado = this.edificios.find(e => e.idEdificio === this.edificioSeleccionado!.idEdificio);
            if (actualizado) {
              this.seleccionarEdificio(actualizado);
              seleccionado = true;
            }
          }
          
          // Si venimos de otra pestaña o se recargó la página 
          if (!seleccionado) {
            const idGuardado = localStorage.getItem('id_edificio_actual');
            if (idGuardado) {
              const guardado = this.edificios.find(e => e.idEdificio === Number(idGuardado));
              if (guardado) {
                this.seleccionarEdificio(guardado);
                seleccionado = true;
              }
            }
          }

          // Por defecto, seleccionamos el primero si no hay historial
          if (!seleccionado) {
            this.seleccionarEdificio(this.edificios[0]);
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toastService.mostrarToast('Error al cargar la infraestructura', 'danger'); 
      }
    });
  }

  seleccionarEdificio(edificio: EdificioDTO): void {
    this.edificioSeleccionado = edificio;
    localStorage.setItem('id_edificio_actual', edificio.idEdificio.toString());
  }

  cerrarModal(): void {
    this.activeModal = null;
    this.cdr.detectChanges(); 
  }

  // EDIFICIOS ---
  abrirModalEdificio(edificio: EdificioDTO): void {
    this.activeModal = 'EDIFICIO';
    this.edificioForm = { ...edificio };
  }

  // --- GUARDAR EDIFICIO ---
  guardarEdificio(): void {
    const { idEdificio, nombre, ubicacion, genero } = this.edificioForm;

    if (!nombre || nombre.trim() === '') {
      this.toastService.mostrarToast('El nombre del edificio es obligatorio.', 'danger');
      return;
    }
    if (!ubicacion || ubicacion.trim() === '') {
      this.toastService.mostrarToast('La ubicación es obligatoria.', 'danger');
      return;
    }

    this.infraestructuraService.modificarEdificio(idEdificio, { nombre, ubicacion, genero }).subscribe({
      next: () => {
        this.toastService.mostrarToast('Edificio modificado correctamente', 'success');
        this.cargarEdificios(); 
        this.cerrarModal();
      },
      error: (err) => {
        console.error(err);
        this.toastService.mostrarToast('Error al modificar el edificio', 'danger');
      }
    });
  }

  // PISOS
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

    if (this.pisoForm.nroPiso === null || this.pisoForm.nroPiso <= 0) {
      this.toastService.mostrarToast('El número de piso debe ser mayor a 0.', 'danger');
      return;
    }
    if (!this.pisoForm.nombre || this.pisoForm.nombre.trim() === '') {
      this.toastService.mostrarToast('El nombre identificador es obligatorio.', 'danger');
      return;
    }

    if (this.modalMode === 'CREATE') {
      this.infraestructuraService.crearPiso(this.pisoForm.nroPiso, this.pisoForm.nombre, this.edificioSeleccionado.idEdificio).subscribe({
        next: () => {
          this.toastService.mostrarToast('Piso agregado correctamente', 'success');
          this.cargarEdificios();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.mostrarToast('Error al crear el piso', 'danger');
        }
      });
    } else {
      this.infraestructuraService.modificarPiso(this.targetIdPiso!, { nroPiso: this.pisoForm.nroPiso, nombre: this.pisoForm.nombre }).subscribe({
        next: () => {
          this.toastService.mostrarToast('Piso modificado correctamente', 'success');
          this.cargarEdificios();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.mostrarToast('Error al modificar el piso', 'danger');
        }
      });
    }
  }

  // HABITACIONES
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
    if (this.habitacionForm.nroHabitacion === null || this.habitacionForm.nroHabitacion <= 0) {
      this.toastService.mostrarToast('El número de habitación es inválido.', 'danger');
      return;
    }
    if (this.habitacionForm.capacidadTotal < 1) {
      this.toastService.mostrarToast('La capacidad máxima debe ser al menos de 1 cama.', 'danger');
      return;
    }
    if (this.habitacionForm.capacidadActual < 0) {
      this.toastService.mostrarToast('Las camas ocupadas no pueden ser negativas.', 'danger');
      return;
    }
    if (this.habitacionForm.capacidadActual > this.habitacionForm.capacidadTotal) {
      this.toastService.mostrarToast('Las camas ocupadas superan la capacidad máxima.', 'danger');
      return;
    }

    if (this.modalMode === 'CREATE') {
      this.infraestructuraService.crearHabitacion(this.habitacionForm.nroHabitacion, this.habitacionForm.capacidadActual, true, this.targetIdPiso!).subscribe({
        next: () => {
          this.toastService.mostrarToast('Habitación añadida correctamente', 'success');
          this.cargarEdificios();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.mostrarToast('Error al crear la habitación', 'danger');
        }
      });
    } else {
      this.infraestructuraService.modificarHabitacion(this.targetIdHabitacion!, {
        nroHabitacion: this.habitacionForm.nroHabitacion,
        capacidadActual: this.habitacionForm.capacidadActual
      }).subscribe({
        next: () => {
          this.toastService.mostrarToast('Habitación modificada correctamente', 'success');
          this.cargarEdificios();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.mostrarToast('Error al modificar la habitación', 'danger');
        }
      });
    }
  }

  toggleDisponibilidad(habitacion: HabitacionDTO): void {
    const nuevoEstado = !habitacion.disponibilidad;
    this.infraestructuraService.modificarHabitacion(habitacion.idHabitacion, { disponibilidad: nuevoEstado }).subscribe({
      next: () => {
        habitacion.disponibilidad = nuevoEstado;
        this.toastService.mostrarToast(nuevoEstado ? 'Habitación habilitada' : 'Habitación bloqueada', 'success');
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error(err);
        this.toastService.mostrarToast('Error al cambiar la disponibilidad', 'danger');
      }
    });
  }

  // ELIMINACIÓN
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
          this.toastService.mostrarToast('Piso eliminado correctamente', 'success');
          this.cargarEdificios();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.mostrarToast('Error al eliminar el piso', 'danger');
        }
      });
    } else if (type === 'HABITACION') {
      this.infraestructuraService.eliminarHabitacion(data.idHabitacion).subscribe({
        next: () => {
          this.toastService.mostrarToast('Habitación eliminada correctamente', 'success');
          this.cargarEdificios();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.mostrarToast('Error al eliminar la habitación', 'danger');
        }
      });
    }
  }
}