import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appRutFormat]',
  standalone: true
})
export class RutFormatDirective {
  
  constructor(private control: NgControl) {}

  // Ahora solo pasamos el $event completo
  @HostListener('input', ['$event'])
  onInput(event: Event) {
    
    // Le decimos a TypeScript que esto es un input de HTML
    const inputElement = event.target as HTMLInputElement;
    
    // Validamos que exista
    if (!inputElement) return;

    const value = inputElement.value;
    if (!value) return;

    // Limpiar todo lo que no sea número o la letra K (y pasarlo a mayúscula)
    let cleaned = value.replace(/[^0-9kK]/g, '').toUpperCase();

    // Aplicar el formato: separar el último dígito con un guion
    let formatted = cleaned;
    if (cleaned.length > 1) {
      const cuerpo = cleaned.slice(0, -1);
      const dv = cleaned.slice(-1);
      formatted = `${cuerpo}-${dv}`;
    }

    // Actualizar el valor real en el modelo de Angular
    if (this.control && this.control.control) {
      this.control.control.setValue(formatted);
    }
  }
}