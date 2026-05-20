import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';

type StateTone = 'error' | 'empty' | 'info';

@Component({
  selector: 'app-state-message',
  template: `
    <div [class]="containerClass()">
      <i [class]="iconClass()" aria-hidden="true"></i>
      <div class="space-y-1">
        @if (title()) {
          <p class="font-semibold">{{ title() }}</p>
        }
        <p>{{ message() }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateMessageComponent {
  readonly tone = input<StateTone>('info');
  readonly title = input<string | null>(null);
  readonly message = input.required<string>();

  readonly containerClass = computed(() => {
    switch (this.tone()) {
      case 'error':
        return 'flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800';
      case 'empty':
        return 'flex items-start gap-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-slate-600';
      default:
        return 'flex items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-cyan-950';
    }
  });

  readonly iconClass = computed(() => {
    switch (this.tone()) {
      case 'error':
        return 'pi pi-exclamation-triangle mt-1 text-rose-500';
      case 'empty':
        return 'pi pi-inbox mt-1 text-slate-400';
      default:
        return 'pi pi-info-circle mt-1 text-cyan-600';
    }
  });
}
