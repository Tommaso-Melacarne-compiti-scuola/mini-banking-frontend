import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { Account } from '../../core/models/banking.models';

@Component({
  selector: 'app-account-card',
  standalone: true,
  imports: [ButtonModule, CardModule, RouterLink],
  template: `
    <p-card class="h-full rounded-3xl border border-slate-200 shadow-sm">
      <ng-template pTemplate="header">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 class="text-xl font-semibold text-slate-950">{{ accountLabel() }}</h2>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {{ account().currency }}
          </span>
        </div>
      </ng-template>

      <div class="space-y-4 text-sm text-slate-600">
        @if (account().createdAt) {
          <div class="flex items-center gap-2">
            <i class="pi pi-calendar text-slate-400"></i>
            <span>Created on {{ accountCreationDate() }}</span>
          </div>
        }
      </div>

      <ng-template pTemplate="footer">
        <div class="flex items-center justify-between gap-3 pt-3">
          <a
            pButton
            [routerLink]="['/accounts', account().id]"
            icon="pi pi-arrow-right"
            aria-label="Open account details"
            class="rounded-2xl"
          >
            Open
          </a>
        </div>
      </ng-template>
    </p-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountCardComponent {
  readonly account = input.required<Account>();

  readonly accountLabel = computed(() => {
    const account = this.account();

    return (
      account.ownerName ?? account.name ?? account.owner ?? account.iban ?? `Account #${account.id}`
    );
  });

  readonly accountCreationDate = computed(() => {
    const createdAt = this.account().createdAt;

    if (!createdAt) {
      return 'Unknown date';
    }

    const date = new Date(createdAt);

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
}
