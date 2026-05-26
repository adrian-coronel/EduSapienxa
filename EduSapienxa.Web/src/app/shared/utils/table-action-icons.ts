export type TableActionTone = 'neutral' | 'primary' | 'danger' | 'success' | 'warning';

const BASE_BUTTON_CLASS =
  'inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent transition-colors duration-150';

const TONE_CLASS: Record<TableActionTone, string> = {
  neutral: 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]',
  primary: 'text-blue-600 hover:bg-blue-50 hover:text-blue-700',
  danger: 'text-red-600 hover:bg-red-50 hover:text-red-700',
  success: 'text-green-600 hover:bg-green-50 hover:text-green-700',
  warning: 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
};

type IconName = 'edit' | 'view' | 'toggle-on' | 'toggle-off' | 'disable' | 'delete';

const ICONS: Record<IconName, string> = {
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 20h9"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  view: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  'toggle-on': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 7h14a4 4 0 010 8H5a4 4 0 010-8z"/></svg>',
  'toggle-off': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9"/><path stroke-linecap="round" stroke-linejoin="round" d="M19 7H5a4 4 0 000 8h14a4 4 0 000-8z"/></svg>',
  disable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18"/><circle cx="12" cy="12" r="9"/></svg>',
  delete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 6V4h8v2"/><path stroke-linecap="round" stroke-linejoin="round" d="M19 6l-1 14H6L5 6"/></svg>'
};

export function tableActionIconButton(
  onClick: string,
  title: string,
  icon: IconName,
  tone: TableActionTone = 'neutral'
): string {
  return `<button type="button" onclick="${onClick}" title="${title}" aria-label="${title}" class="${BASE_BUTTON_CLASS} ${TONE_CLASS[tone]}">${ICONS[icon]}</button>`;
}

