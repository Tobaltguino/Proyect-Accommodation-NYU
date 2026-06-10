import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoRut',
  standalone: true
})
export class RutPipe implements PipeTransform {
  transform(value: string | number): string {
    if (!value) return '';

    // 1. Limpiamos el texto: dejamos solo números y la letra 'k' (o 'K')
    let cleanRut = value.toString().replace(/[^0-9kK]+/g, '').toUpperCase();

    // Si por alguna razón es muy corto, lo devolvemos tal cual
    if (cleanRut.length <= 1) return cleanRut;

    // 2. Separamos el dígito verificador (el último caracter)
    const dv = cleanRut.slice(-1);
    
    // 3. Tomamos el resto de los números
    let rutNumbers = cleanRut.slice(0, -1);

    // 4. Usamos una expresión regular mágica para poner los puntos cada 3 números
    rutNumbers = rutNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // 5. Unimos todo con el guion
    return `${rutNumbers}-${dv}`;
  }
}