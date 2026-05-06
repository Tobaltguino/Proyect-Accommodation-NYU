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
      id_edificio: 1, nombre: 'Residencia Norte', ubicacion: 'Campus Norte', genero: Genero.MIXTO,
      pisos: [
        {
          id_piso: 1, nro_piso: 1, nombre: 'Primer Piso', id_edificio: 1, habitaciones: [
            { id_habitacion: 10, nro_habitacion: 101, capacidad_actual: 0, capacidad_total: 2, disponibilidad: true, id_piso: 1 },
            { id_habitacion: 11, nro_habitacion: 102, capacidad_actual: 1, capacidad_total: 2, disponibilidad: true, id_piso: 1 },
            { id_habitacion: 12, nro_habitacion: 103, capacidad_actual: 2, capacidad_total: 2, disponibilidad: true, id_piso: 1 },
            { id_habitacion: 13, nro_habitacion: 104, capacidad_actual: 0, capacidad_total: 4, disponibilidad: false, id_piso: 1 } // Deshabilitada por mantenimiento
          ]
        },
        {
          id_piso: 2, nro_piso: 2, nombre: 'Segundo Piso', id_edificio: 1, habitaciones: [
            { id_habitacion: 14, nro_habitacion: 201, capacidad_actual: 0, capacidad_total: 2, disponibilidad: true, id_piso: 2 },
            { id_habitacion: 15, nro_habitacion: 202, capacidad_actual: 0, capacidad_total: 2, disponibilidad: true, id_piso: 2 }
          ]
        }
      ]
    },
    {
      id_edificio: 2, nombre: 'Pabellón Sur', ubicacion: 'Campus Sur', genero: Genero.FEMENINO,
      pisos: [
        {
          id_piso: 3, nro_piso: 1, nombre: 'Primer Piso', id_edificio: 2, habitaciones: [
            { id_habitacion: 20, nro_habitacion: 101, capacidad_actual: 4, capacidad_total: 4, disponibilidad: true, id_piso: 3 },
            { id_habitacion: 21, nro_habitacion: 102, capacidad_actual: 1, capacidad_total: 4, disponibilidad: true, id_piso: 3 }
          ]
        }
      ]
    }
  ];

  edificioSeleccionado: EdificioDTO | null = null;
  
  ngOnInit(): void {
    // Por defecto, seleccionamos el primer edificio al cargar la página
    if (this.edificiosDisponibles.length > 0) {
      this.edificioSeleccionado = this.edificiosDisponibles[0];
    }
  }

  seleccionarEdificio(edificio: EdificioDTO): void {
    this.edificioSeleccionado = edificio;
  }
}