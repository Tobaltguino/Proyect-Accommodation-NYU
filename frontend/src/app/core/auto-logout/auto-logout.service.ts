import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  // 15 minutos en milisegundos
  private readonly TIMEOUT_MS = 15 * 60 * 1000; 
  
  private timeoutId: any;
  private activitySubscription?: Subscription;

  public iniciarControlInactividad(): void {
    this.detenerControlInactividad();

    this.ngZone.runOutsideAngular(() => {
      // Actividades
      const mouseMove$ = fromEvent(window, 'mousemove');
      const click$ = fromEvent(window, 'click');
      const keyPress$ = fromEvent(window, 'keypress');
      const scroll$ = fromEvent(window, 'scroll');

      const userActivity$ = merge(mouseMove$, click$, keyPress$, scroll$).pipe(
        // throttleTime(2000)
        throttleTime(2000) 
      );

      // Se reinicia el contador si pasa un evento
      this.activitySubscription = userActivity$.subscribe(() => {
        this.reiniciarTemporizador();
      });

      this.iniciarTemporizador();
    });
  }

  public detenerControlInactividad(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
    }
  }

  private iniciarTemporizador(): void {
    this.timeoutId = setTimeout(() => {
      this.caducarSesion();
    }, this.TIMEOUT_MS);
  }

  private reiniciarTemporizador(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.iniciarTemporizador();
  }

  private caducarSesion(): void {
    this.ngZone.run(() => {
      console.warn('Sesión expirada por inactividad (15 minutos).');
      
      this.authService.logout(); 
      
      this.detenerControlInactividad();
      
      void this.router.navigate(['/login']);
    });
  }
}