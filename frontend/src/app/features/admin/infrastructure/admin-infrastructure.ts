import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Room {
  code: string;
  totalBeds: number;
}

interface Floor {
  level: number;
  rooms: Room[];
}

interface Building {
  id: string;
  name: string;
  status: 'ACTIVO' | 'MANTENIMIENTO';
  floors: Floor[];
}

@Component({
  selector: 'app-admin-infrastructure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-infrastructure.html',
  styleUrl: './admin-infrastructure.scss'
})
export class AdminInfrastructureComponent {
  // Datos simulados iniciales
  buildings: Building[] = [
    {
      id: 'B1',
      name: 'Residencia Norte',
      status: 'ACTIVO',
      floors: [
        {
          level: 1,
          rooms: [
            { code: '101', totalBeds: 2 },
            { code: '102', totalBeds: 4 },
            { code: '103', totalBeds: 2 }
          ]
        },
        {
          level: 2,
          rooms: [
            { code: '201', totalBeds: 2 },
            { code: '202', totalBeds: 4 }
          ]
        }
      ]
    },
    {
      id: 'B2',
      name: 'Pabellón Sur',
      status: 'MANTENIMIENTO',
      floors: []
    }
  ];

  selectedBuilding: Building | null = this.buildings[0];

  selectBuilding(building: Building): void {
    this.selectedBuilding = building;
  }

  // Métodos placeholder para tus futuras implementaciones de modales o formularios
  createNewBuilding(): void {
    console.log('Abrir modal para crear edificio');
  }

  createNewFloor(): void {
    console.log('Agregar piso al edificio:', this.selectedBuilding?.name);
  }

  createNewRoom(floorLevel: number): void {
    console.log('Agregar habitación al piso:', floorLevel);
  }
}