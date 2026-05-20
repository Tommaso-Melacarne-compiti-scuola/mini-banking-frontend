import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

import {
  BalanceConversionResponse,
  BalanceResponse,
  ConversionKind,
} from '../../../core/models/banking.models';

type BalanceFormGroup = FormGroup<{ to: FormControl<string> }>;

@Component({
  selector: 'app-account-balance-card',
  imports: [ButtonModule, CardModule, DecimalPipe, InputTextModule, ReactiveFormsModule],
  template: `
    <p-card class="rounded-3xl border border-slate-200 shadow-sm">
      <ng-template pTemplate="header">
        <div class="border-b border-slate-200 px-5 py-4">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">Balance</p>
          <h2 class="text-xl font-semibold text-slate-950">
            {{ balance()?.balance ?? 0 | number: '1.2-2' }}
          </h2>
        </div>
      </ng-template>

      <div class="space-y-4">
        <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label class="space-y-2 text-sm font-medium text-slate-700">
            Convert to
            <input
              pInputText
              type="text"
              [formControl]="balanceForm().controls.to"
              placeholder="USD or BTC"
              class="w-full rounded-2xl"
            />
          </label>

          <div class="flex items-end gap-2">
            <p-button
              label="Fiat"
              icon="pi pi-wallet"
              severity="secondary"
              (onClick)="convert.emit('fiat')"
              [loading]="conversionSaving() && conversionKind() === 'fiat'"
            />
            <p-button
              label="Crypto"
              icon="pi pi-bitcoin"
              severity="secondary"
              (onClick)="convert.emit('crypto')"
              [loading]="conversionSaving() && conversionKind() === 'crypto'"
            />
          </div>
        </div>

        @if (conversion()) {
          <div class="rounded-2xl bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
            <p class="font-semibold">Conversion result</p>
            <p>
              {{ conversion()?.original_balance | number: '1.2-2' }}
              →
              {{ conversion()?.converted_balance | number: '1.2-8' }}
              {{ conversion()?.currency }}
            </p>
          </div>
        }
      </div>
    </p-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountBalanceCardComponent {
  readonly balance = input<BalanceResponse | null>(null);
  readonly conversion = input<BalanceConversionResponse | null>(null);
  readonly conversionKind = input<ConversionKind>('fiat');
  readonly conversionSaving = input(false);
  readonly balanceForm = input.required<BalanceFormGroup>();

  readonly convert = output<ConversionKind>();
}
