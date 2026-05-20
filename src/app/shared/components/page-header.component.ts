import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-2">
        @if (eyebrow()) {
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
            {{ eyebrow() }}
          </p>
        }

        <h1 class="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {{ title() }}
        </h1>

        @if (subtitle()) {
          <p class="text-slate-600">{{ subtitle() }}</p>
        }
      </div>

      <div class="flex flex-wrap gap-3">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
