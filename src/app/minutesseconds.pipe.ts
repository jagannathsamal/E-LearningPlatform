import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minutesSeconds',
  standalone: true
})
export class MinutesSecondsPipe implements PipeTransform {
  transform(value: number): string {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}