import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appRutFormat]',
  standalone: true
})
export class RutFormatDirective {

  constructor(private control: NgControl) {}

  // 👇 Cambiamos aquí para recibir el evento completo
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    
    // 👇 Le aseguramos a TypeScript que esto es un input de HTML
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value;

    if (!value) return;

    // 1. Limpiamos el texto: quitamos puntos, guiones y letras (dejamos solo números y la K)
    let rutLimpio = value.replace(/[^0-9kK]/g, '').toUpperCase();

    // 2. Formateamos: agregamos puntos y guion
    let rutFormateado = '';
    
    if (rutLimpio.length > 1) {
      // Separamos el dígito verificador del resto del cuerpo
      const cuerpo = rutLimpio.slice(0, -1);
      const dv = rutLimpio.slice(-1);
      
      // Expresión regular para poner un punto cada 3 números de derecha a izquierda
      const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      
      rutFormateado = `${cuerpoConPuntos}-${dv}`;
    } else {
      rutFormateado = rutLimpio;
    }

    // 3. Actualizamos el input visual y el modelo
    this.control.control?.setValue(rutFormateado, { emitEvent: false });
  }
}