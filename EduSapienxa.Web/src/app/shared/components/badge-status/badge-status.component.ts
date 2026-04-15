import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { LeadStatus } from '../../../core/models/lead.model';

type Status = LeadStatus | 'active' | 'inactive' | 'admin' | 'editor';

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
  @Input() status: Status = 'new';

  get label(): string {
    const labels: Record<Status, string> = {
      new: 'Nuevo',
      contacted: 'En conversación',
      interested: 'Interesado',
      converted: 'Convertido',
      lost: 'Inactivo',
      active: 'Activo',
      inactive: 'Inactivo',
      admin: 'Admin',
      editor: 'Editor'
    };
    return labels[this.status] ?? this.status;
  }

  get badgeClass(): string {
    const classes: Record<Status, string> = {
      new: 'bg-blue-50 text-blue-700',
      contacted: 'bg-amber-50 text-amber-700',
      interested: 'bg-violet-50 text-violet-700',
      converted: 'bg-green-50 text-green-700',
      lost: 'bg-gray-100 text-gray-600',
      active: 'bg-green-50 text-green-700',
      inactive: 'bg-gray-100 text-gray-600',
      admin: 'bg-purple-50 text-purple-700',
      editor: 'bg-blue-50 text-blue-700'
    };
    return classes[this.status] ?? 'bg-gray-100 text-gray-600';
  }

  get dotClass(): string {
    const dots: Record<Status, string> = {
      new: 'bg-blue-500',
      contacted: 'bg-amber-500',
      interested: 'bg-violet-500',
      converted: 'bg-green-500',
      lost: 'bg-gray-400',
      active: 'bg-green-500',
      inactive: 'bg-gray-400',
      admin: 'bg-purple-500',
      editor: 'bg-blue-500'
    };
    return dots[this.status] ?? 'bg-gray-400';
  }
}
