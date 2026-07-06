import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastData {
  mensaje: string;
  tipo: 'success' | 'danger';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Observa el estado actual del Toast
  private toastSubject = new BehaviorSubject<ToastData | null>(null);
  public toast$ = this.toastSubject.asObservable();

  private timeoutId: any;

  // Llama a este método desde cualquier componente
  mostrarToast(mensaje: string, tipo: 'success' | 'danger' = 'success'): void {
    this.toastSubject.next({ mensaje, tipo });

    // Limpiar el timeout anterior si el usuario lanza dos toasts muy rápido
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Ocultar automáticamente después de 4 segundos
    this.timeoutId = setTimeout(() => {
      this.ocultarToast();
    }, 4000);
  }

  ocultarToast(): void {
    this.toastSubject.next(null);
  }
}