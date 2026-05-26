import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

type Status = 'New' | 'Interesado' | 'EscaladoAHumano' | 'Pendiente Pago' | 'Pagado' | 'Inactivo' | 'active' | 'inactive' | 'admin' | 'editor';

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
  @Input() status: Status = 'New';

  get label(): string {
    const labels: Record<Status, string> = {
      'New': 'Nuevo',
      'Interesado': 'Interesado',
      'EscaladoAHumano': 'Escalado',
      'Pendiente Pago': 'Pendiente Pago',
      'Pagado': 'Pagado',
      'Inactivo': 'Inactivo',
      active: 'Activo',
      inactive: 'Inactivo',
      admin: 'Admin',
      editor: 'Editor'
    };
    return labels[this.status] ?? this.status;
  }

  get badgeClass(): string {
    const classes: Record<Status, string> = {
      'New': 'bg-blue-50 text-blue-700',
      'Interesado': 'bg-violet-50 text-violet-700',
      'EscaladoAHumano': 'bg-orange-50 text-orange-700',
      'Pendiente Pago': 'bg-yellow-50 text-yellow-700',
      'Pagado': 'bg-green-50 text-green-700',
      'Inactivo': 'bg-gray-100 text-gray-600',
      active: 'bg-green-50 text-green-700',
      inactive: 'bg-gray-100 text-gray-600',
      admin: 'bg-purple-50 text-purple-700',
      editor: 'bg-blue-50 text-blue-700'
    };
    return classes[this.status] ?? 'bg-gray-100 text-gray-600';
  }

  get dotClass(): string {
    const dots: Record<Status, string> = {
      'New': 'bg-blue-500',
      'Interesado': 'bg-violet-500',
      'EscaladoAHumano': 'bg-orange-500',
      'Pendiente Pago': 'bg-yellow-500',
      'Pagado': 'bg-green-500',
      'Inactivo': 'bg-gray-400',
      active: 'bg-green-500',
      inactive: 'bg-gray-400',
      admin: 'bg-purple-500',
      editor: 'bg-blue-500'
    };
    return dots[this.status] ?? 'bg-gray-400';
  }
}
