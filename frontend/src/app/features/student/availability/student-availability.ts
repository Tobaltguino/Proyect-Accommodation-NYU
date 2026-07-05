import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EdificioDTO, Genero } from '../../../shared/models'; 
import { InfraestructuraService } from '../../../core/services/infraestructura.service';
import { AuthService } from '../../../core/auth/auth.service';

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
    const usuarioActual = this.authService.getCurrentUser();
    
    const generoEstudiante = usuarioActual?.genero || 'Mixto';

    if (this.infraestructuraService.cacheEdificios.length > 0) {
      this.edificiosDisponibles = this.infraestructuraService.cacheEdificios;
      this.edificioSeleccionado = this.infraestructuraService.cacheEdificioSeleccionado;
    }

    this.infraestructuraService.obtenerInfraestructuraCompletaPorGenero(generoEstudiante).subscribe({
      next: (data: EdificioDTO[]) => {
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
      error: (err: any) => console.error('Error al cargar edificios por género:', err)
    });
  }

  seleccionarEdificio(edificio: EdificioDTO): void {
    this.edificioSeleccionado = edificio;
    this.infraestructuraService.cacheEdificioSeleccionado = edificio;
  
    this.cdr.detectChanges(); 
  }
}