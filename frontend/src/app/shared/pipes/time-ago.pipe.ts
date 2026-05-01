import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const fechaPasada = new Date(value);
    const ahora = new Date();
    
    // Calculamos la diferencia en segundos
    const segundos = Math.round(Math.abs((ahora.getTime() - fechaPasada.getTime()) / 1000));

    // Convertimos a otras unidades
    const minutos = Math.round(Math.abs(segundos / 60));
    const horas = Math.round(Math.abs(minutos / 60));
    const dias = Math.round(Math.abs(horas / 24));
    const meses = Math.round(Math.abs(dias / 30.416));
    const anos = Math.round(Math.abs(dias / 365));

    // Lógica para decidir qué texto mostrar
    if (Number.isNaN(segundos)) {
      return '';
    } else if (segundos <= 45) {
      return 'hace unos segundos';
    } else if (segundos <= 90) {
      return 'hace un minuto';
    } else if (minutos <= 45) {
      return `hace ${minutos} minutos`;
    } else if (minutos <= 90) {
      return 'hace una hora';
    } else if (horas <= 22) {
      return `hace ${horas} horas`;
    } else if (horas <= 36) {
      return 'ayer';
    } else if (dias <= 25) {
      return `hace ${dias} días`;
    } else if (dias <= 45) {
      return 'hace un mes';
    } else if (dias <= 345) {
      return `hace ${meses} meses`;
    } else if (dias <= 545) {
      return 'hace un año';
    } else {
      return `hace ${anos} años`;
    }
  }
}