import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionUser } from '../../../core/auth/auth.models';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  standalone: true,
  imports: [RouterModule] 
})
export class AdminLayoutComponent {
  readonly currentUser: SessionUser | null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}