import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appRutFormat]',
  standalone: true
})
export class RutFormatDirective {
  // Inyectamos NgControl para poder actualizar el [(ngModel)] automáticamente
  constructor(private control: NgControl) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    if (!value) return;

    // 1. Limpiar todo lo que no sea número o la letra K (y pasarlo a mayúscula)
    let cleaned = value.replace(/[^0-9kK]/g, '').toUpperCase();

    // 2. Aplicar el formato: separar el último dígito con un guion
    let formatted = cleaned;
    if (cleaned.length > 1) {
      const cuerpo = cleaned.slice(0, -1);
      const dv = cleaned.slice(-1);
      formatted = `${cuerpo}-${dv}`;
    }

    // 3. Actualizar el valor real en el modelo de Angular
    if (this.control && this.control.control) {
      this.control.control.setValue(formatted);
    }
  }
}