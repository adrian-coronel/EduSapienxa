import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-field-tooltip',
  standalone: true,
  template: `
    <span class="relative inline-flex group/tip">
      <span class="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[var(--color-muted)] text-[10px] font-bold text-[var(--color-muted-foreground)] transition-colors group-hover/tip:bg-[oklch(45%_0.2_260)] group-hover/tip:text-white select-none">?</span>
      <span class="pointer-events-none absolute left-1/2 bottom-full z-50 mb-2 w-60 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover/tip:opacity-100">
        {{ text }}
        <span class="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
      </span>
    </span>
  `
})
export class FieldTooltipComponent {
  @Input() text = '';
}
