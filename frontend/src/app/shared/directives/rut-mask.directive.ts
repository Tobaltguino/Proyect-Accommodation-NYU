import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appRutMask]',
  standalone: true
})
export class RutMaskDirective {
  
  // Inyectamos el elemento HTML (el input) y opcionalmente el control del formulario de Angular
  constructor(
    private el: ElementRef,
    @Optional() private control: NgControl
  ) {}

  // @HostListener escucha cada vez que el usuario teclea algo ('input')
  @HostListener('input', ['$event'])
  onInput(event: any): void {
    // 1. Obtenemos lo que el usuario acaba de escribir
    let valorActual = this.el.nativeElement.value;
    
    // 2. Lo pasamos por nuestra función formateadora
    let valorFormateado = this.formatearRut(valorActual);

    // 3. Actualizamos visualmente el input en la pantalla
    this.el.nativeElement.value = valorFormateado;

    // 4. (Muy importante) Si estamos usando formControlName o ngModel, 
    // le avisamos a Angular del nuevo valor para que el formulario no se desincronice
    if (this.control && this.control.control) {
      this.control.control.setValue(valorFormateado, { emitEvent: false });
    }
  }

  // La lógica de transformación (similar a la del Pipe)
  private formatearRut(valor: string): string {
    if (!valor) return '';

    // Limpiamos todo lo que no sea número o la letra K
    let rutLimpio = valor.replace(/[^0-9kK]+/g, '').toUpperCase();
    
    if (rutLimpio.length === 0) return '';
    if (rutLimpio.length <= 1) return rutLimpio;

    // Separamos el último dígito
    const dv = rutLimpio.slice(-1);
    let numeros = rutLimpio.slice(0, -1);

    // Agregamos los puntos
    numeros = numeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Unimos con el guion
    return `${numeros}-${dv}`;
  }
}