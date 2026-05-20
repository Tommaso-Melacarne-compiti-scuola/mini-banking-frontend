import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

import { CurrencyService, CurrencyInfo } from '../../../core/services/currency.service';

@Component({
  selector: 'app-currency-conversion-dialog',
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, SelectModule],
  template: `
    <p-dialog
      [visible]="visible()"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: 'min(42rem, 95vw)' }"
      [contentStyle]="{ overflow: 'visible' }"
      header="Convert Balance"
    >
      <div class="space-y-5">
        <label class="block space-y-2 text-sm font-medium text-slate-700">
          Target Currency
          <p-select
            [ngModel]="selectedCurrency()"
            (ngModelChange)="selectedCurrency.set($event)"
            [options]="currencies()"
            optionLabel="name"
            optionValue="code"
            placeholder="Select a currency"
            [showClear]="true"
            class="w-full"
          />
        </label>

        @if (selectedCurrency() && detectedType()) {
          <div class="rounded-2xl bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
            <p class="font-semibold">
              Converting to <span class="font-mono font-bold">{{ selectedCurrency() }}</span>
              ({{ detectedType() === 'crypto' ? '💰 Crypto' : '💵 Fiat' }})
            </p>
          </div>
        }

        <div class="flex items-center justify-end gap-3 pt-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            type="button"
            (onClick)="dismiss.emit()"
          />
          <p-button
            label="Convert"
            icon="pi pi-check"
            [disabled]="!selectedCurrency()"
            [loading]="saving()"
            (onClick)="save.emit({
              currency: selectedCurrency(),
              kind: (detectedType() || 'fiat')
            })"
          />
        </div>
      </div>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyConversionDialogComponent implements OnInit {
  private readonly currencyService = inject(CurrencyService);

  readonly visible = input(false);
  readonly saving = input(false);

  readonly currencies = signal<CurrencyInfo[]>([]);
  readonly selectedCurrency = signal<string>('');

  readonly detectedType = computed(() => {
    if (!this.selectedCurrency()) return null;
    const currency = this.currencies().find((c) => c.code === this.selectedCurrency());
    return currency?.isCrypto ? 'crypto' : 'fiat';
  });

  readonly visibleChange = output<boolean>();
  readonly save = output<{ currency: string; kind: 'fiat' | 'crypto' }>();
  readonly dismiss = output<void>();

  ngOnInit(): void {
    this.loadCurrencies();
  }

  private loadCurrencies(): void {
    this.currencyService.getAvailableCurrencies().subscribe({
      next: (currencies) => {
        this.currencies.set(currencies);
      },
      error: (err) => {
        console.error('Failed to load currencies:', err);
      },
    });
  }
}



