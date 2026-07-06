import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../core/auth/auth.service';
import { SessionUser } from '../core/auth/auth.models';
import { GlobalToastComponent } from '../shared/components/global-toast/global-toast';

// Formato menu
interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
  standalone: true,
  imports: [RouterModule, CommonModule, GlobalToastComponent]
})
export class DashboardLayoutComponent implements OnInit {
  readonly currentUser: SessionUser | null;
  
  menuItems: MenuItem[] = [];
  
  isCollapsed: boolean = false;

  private readonly allMenuItems: MenuItem[] = [
    // Admin
    { label: 'Inicio', icon: 'pi pi-home', route: '/admin/home', roles: ['ADMIN'] },
    { label: 'Solicitudes', icon: 'pi pi-inbox', route: '/admin/requests', roles: ['ADMIN'] },
    { label: 'Asignaciones', icon: 'pi pi-users', route: '/admin/assignments', roles: ['ADMIN'] },
    { label: 'Check In/Out', icon: 'pi pi-key', route: '/admin/stay-management', roles: ['ADMIN'] },
    { label: 'Incidencias', icon: 'pi pi-exclamation-triangle', route: '/admin/incidents', roles: ['ADMIN'] },
    { label: 'Infraestructura', icon: 'pi pi-building', route: '/admin/infrastructure', roles: ['ADMIN'] },
    
    // Estudiante
    { label: 'Inicio', icon: 'pi pi-home', route: '/student/home', roles: ['STUDENT'] },
    { label: 'Postulación', icon: 'pi pi-file-edit', route: '/student/postulation', roles: ['STUDENT'] },
    { label: 'Estado Solicitud', icon: 'pi pi-info-circle', route: '/student/status', roles: ['STUDENT'] },
    { label: 'Disponibilidad', icon: 'pi pi-calendar-plus', route: '/student/availability', roles: ['STUDENT'] },
    { label: 'Mi Historial', icon: 'pi pi-history', route: '/student/stay-history', roles: ['STUDENT'] },
    { label: 'Mis Incidencias', icon: 'pi pi-exclamation-triangle', route: '/student/incidents', roles: ['STUDENT'] }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.buildMenu();
    // Colapsar automáticamente en pantallas móviles al iniciar
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  private checkScreenSize(): void {
    if (window.innerWidth < 768) {
      this.isCollapsed = true;
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  private buildMenu(): void {
    const userRole = this.currentUser?.role ?? ''; 
    
    this.menuItems = this.allMenuItems.filter(item => 
      item.roles.includes(userRole)
    );
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}