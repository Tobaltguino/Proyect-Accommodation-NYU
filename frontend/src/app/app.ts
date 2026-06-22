import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AutoLogoutService } from './core/auto-logout/auto-logout.service';
import { AuthService } from './core/auth/auth.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private autoLogoutService = inject(AutoLogoutService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Al cargar la app, revisamos si el usuario está logueado para arrancar el temporizador
    if (this.authService.getCurrentUser()) {
      this.autoLogoutService.iniciarControlInactividad();
    }
  }

  ngOnDestroy(): void {
    // Limpieza de memoria por si el componente se destruye
    this.autoLogoutService.detenerControlInactividad();
  }
}