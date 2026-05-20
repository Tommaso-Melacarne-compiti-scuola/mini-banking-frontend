import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';

import {
  BalanceConversionResponse,
  BalanceResponse,
} from '../../../core/models/banking.models';

@Component({
  selector: 'app-account-balance-card',
  imports: [CardModule, DecimalPipe],
  template: `
    <p-card class="rounded-3xl border border-slate-200 shadow-sm">
      <ng-template pTemplate="body">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">Balance</p>
          <h2 class="text-3xl font-bold text-slate-950 mt-1">
            {{ balance()?.balance ?? 0 | number: '1.2-2' }}
          </h2>
      </ng-template>
    </p-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountBalanceCardComponent {
  readonly balance = input<BalanceResponse | null>(null);
}
