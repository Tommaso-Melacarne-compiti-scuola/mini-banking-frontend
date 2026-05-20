import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-grid',
  template: `
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      @for (index of indices(); track index) {
        <div
          aria-hidden="true"
          class="h-40 animate-pulse rounded-3xl border border-slate-200 bg-slate-100"
        ></div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonGridComponent {
  readonly count = input(3);

  readonly indices = computed(() => Array.from({ length: this.count() }, (_, index) => index));
}
