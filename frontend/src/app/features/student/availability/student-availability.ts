import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { EdificioDTO, Genero } from '../../../shared/models'; 
import { InfraestructuraService } from '../../../core/services/infraestructura.service';
import { AuthService } from '../../../core/auth/auth.service'; // Ajusta la ruta a tu AuthService

@Component({
  selector: 'app-student-availability',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-availability.html',
  styleUrl: './student-availability.scss'
})
export class StudentAvailabilityComponent implements OnInit {
  public GeneroEnum = Genero; 
  private infraestructuraService = inject(InfraestructuraService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  edificiosDisponibles: EdificioDTO[] = [];
  edificioSeleccionado: EdificioDTO | null = null;
  
  ngOnInit(): void {
    this.cargarEdificios();
  }

  cargarEdificios(): void {
    // 1. Obtenemos el usuario oficial desde el AuthService
    const usuarioActual = this.authService.getCurrentUser();
    
    // 2. Extraemos el género (Usamos 'Mixto' por defecto como seguridad)
    // Asumiendo que la propiedad en tu interfaz SessionUser se llama 'genero'
    const generoEstudiante = usuarioActual?.genero || 'Mixto';

    // 3. Pintamos instantáneamente si ya hay datos en caché
    if (this.infraestructuraService.cacheEdificios.length > 0) {
      this.edificiosDisponibles = this.infraestructuraService.cacheEdificios;
      this.edificioSeleccionado = this.infraestructuraService.cacheEdificioSeleccionado;
    }

    // 4. Disparamos la petición HTTP protegida con el Token
    this.infraestructuraService.obtenerEdificiosPorGenero(generoEstudiante).subscribe({
      next: (data) => {
        this.infraestructuraService.cacheEdificios = data;
        this.edificiosDisponibles = data;
        this.cdr.detectChanges(); 

        if (this.edificiosDisponibles.length > 0) {
          if (this.edificioSeleccionado) {
            const actualizado = this.edificiosDisponibles.find(e => e.idEdificio === this.edificioSeleccionado!.idEdificio);
            if (actualizado) {
              this.seleccionarEdificio(actualizado);
              return;
            }
          }
          this.seleccionarEdificio(this.edificiosDisponibles[0]);
        }
      },
      error: (err) => console.error('Error al cargar edificios por género:', err)
    });
  }

  seleccionarEdificio(edificio: EdificioDTO): void {
    this.edificioSeleccionado = edificio;
    this.infraestructuraService.cacheEdificioSeleccionado = edificio;
    this.cargarDetallesEdificio(edificio.idEdificio);
  }

  cargarDetallesEdificio(idEdificio: number): void {
    forkJoin({
      pisos: this.infraestructuraService.obtenerPisosPorEdificio(idEdificio),
      habitaciones: this.infraestructuraService.obtenerHabitacionesPorEdificio(idEdificio)
    }).subscribe({
      next: ({ pisos, habitaciones }) => {
        if (this.edificioSeleccionado && this.edificioSeleccionado.idEdificio === idEdificio) {
          
          const pisosOrdenados = pisos.sort((a, b) => a.nroPiso - b.nroPiso);

          this.edificioSeleccionado = {
            ...this.edificioSeleccionado,
            pisos: pisosOrdenados.map(piso => {
              const habitacionesDelPiso = habitaciones.filter(h => h.idPiso === piso.idPiso);
              const habitacionesOrdenadas = habitacionesDelPiso.sort((a, b) => a.nroHabitacion - b.nroHabitacion);
              
              return {
                ...piso,
                habitaciones: habitacionesOrdenadas
              };
            })
          };
          
          this.infraestructuraService.cacheEdificioSeleccionado = this.edificioSeleccionado;
          this.cdr.detectChanges(); 
        }
      },
      error: (err) => console.error('Error al cargar los detalles del edificio:', err)
    });
  }
}