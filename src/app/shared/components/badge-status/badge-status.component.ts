import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

type Status = 'nuevo' | 'en_conversacion' | 'convertido' | 'inactivo' | 'active' | 'inactive' | 'admin' | 'editor';

@Component({
  selector: 'app-badge-status',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      [ngClass]="badgeClass"
      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
    >
      <span class="mr-1 h-1.5 w-1.5 rounded-full" [ngClass]="dotClass"></span>
      {{ label }}
    </span>
  `
})
export class BadgeStatusComponent {
  @Input() status: Status = 'nuevo';

  get label(): string {
    const labels: Record<Status, string> = {
      nuevo: 'Nuevo',
      en_conversacion: 'En conversación',
      convertido: 'Convertido',
      inactivo: 'Inactivo',
      active: 'Activo',
      inactive: 'Inactivo',
      admin: 'Admin',
      editor: 'Editor'
    };
    return labels[this.status] ?? this.status;
  }

  get badgeClass(): string {
    const classes: Record<Status, string> = {
      nuevo: 'bg-blue-50 text-blue-700',
      en_conversacion: 'bg-amber-50 text-amber-700',
      convertido: 'bg-green-50 text-green-700',
      inactivo: 'bg-gray-100 text-gray-600',
      active: 'bg-green-50 text-green-700',
      inactive: 'bg-gray-100 text-gray-600',
      admin: 'bg-purple-50 text-purple-700',
      editor: 'bg-blue-50 text-blue-700'
    };
    return classes[this.status] ?? 'bg-gray-100 text-gray-600';
  }

  get dotClass(): string {
    const dots: Record<Status, string> = {
      nuevo: 'bg-blue-500',
      en_conversacion: 'bg-amber-500',
      convertido: 'bg-green-500',
      inactivo: 'bg-gray-400',
      active: 'bg-green-500',
      inactive: 'bg-gray-400',
      admin: 'bg-purple-500',
      editor: 'bg-blue-500'
    };
    return dots[this.status] ?? 'bg-gray-400';
  }
}
