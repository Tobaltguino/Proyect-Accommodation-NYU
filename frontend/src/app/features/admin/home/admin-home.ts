import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.scss',
  standalone: true,
  imports: [RouterModule]
})
export class AdminHomeComponent {
  readonly currentUser: SessionUser | null;

  // Datos simulados para el resumen del dashboard
  stats = {
    pendingRequests: 12,
    activeIncidents: 3,
    totalStudents: 145,
    availableRooms: 18
  };

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  goTo(route: string): void {
    void this.router.navigate([`/admin/${route}`]);
  }
}