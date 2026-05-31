import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EdificioDTO, Genero } from '../../../shared/models'; 

@Component({
  selector: 'app-student-availability',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-availability.html',
  styleUrl: './student-availability.scss'
})
export class StudentAvailabilityComponent implements OnInit {
  public GeneroEnum = Genero; 
  
  edificiosDisponibles: EdificioDTO[] = [
    {
      idEdificio: 1, nombre: 'Residencia Norte', ubicacion: 'Campus Norte', genero: Genero.MIXTO,
      pisos: [
        {
          idPiso: 1, nroPiso: 1, nombre: 'Primer Piso', idEdificio: 1, habitaciones: [
            { idHabitacion: 10, nroHabitacion: 101, capacidadActual: 0, capacidadTotal: 2, disponibilidad: true, idPiso: 1 },
            { idHabitacion: 11, nroHabitacion: 102, capacidadActual: 1, capacidadTotal: 2, disponibilidad: true, idPiso: 1 },
            { idHabitacion: 12, nroHabitacion: 103, capacidadActual: 2, capacidadTotal: 2, disponibilidad: true, idPiso: 1 },
            { idHabitacion: 13, nroHabitacion: 104, capacidadActual: 0, capacidadTotal: 4, disponibilidad: false, idPiso: 1 } // Deshabilitada
          ]
        },
        {
          idPiso: 2, nroPiso: 2, nombre: 'Segundo Piso', idEdificio: 1, habitaciones: [
            { idHabitacion: 14, nroHabitacion: 201, capacidadActual: 0, capacidadTotal: 2, disponibilidad: true, idPiso: 2 },
            { idHabitacion: 15, nroHabitacion: 202, capacidadActual: 0, capacidadTotal: 2, disponibilidad: true, idPiso: 2 }
          ]
        }
      ]
    },
    {
      idEdificio: 2, nombre: 'Pabellón Sur', ubicacion: 'Campus Sur', genero: Genero.FEMENINO,
      pisos: [
        {
          idPiso: 3, nroPiso: 1, nombre: 'Primer Piso', idEdificio: 2, habitaciones: [
            { idHabitacion: 20, nroHabitacion: 101, capacidadActual: 4, capacidadTotal: 4, disponibilidad: true, idPiso: 3 },
            { idHabitacion: 21, nroHabitacion: 102, capacidadActual: 1, capacidadTotal: 4, disponibilidad: true, idPiso: 3 }
          ]
        }
      ]
    }
  ];

  edificioSeleccionado: EdificioDTO | null = null;
  
  ngOnInit(): void {
    if (this.edificiosDisponibles.length > 0) {
      this.edificioSeleccionado = this.edificiosDisponibles[0];
    }
  }

  seleccionarEdificio(edificio: EdificioDTO): void {
    this.edificioSeleccionado = edificio;
  }
}