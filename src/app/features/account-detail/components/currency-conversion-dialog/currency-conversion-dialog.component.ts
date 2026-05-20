import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  OnInit,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

import { CurrencyService, CurrencyInfo } from '../../../../core/services/currency.service';
import { BalanceConversionResponse } from '../../../../core/models/banking.models';

@Component({
  selector: 'app-currency-conversion-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, SelectModule],
  templateUrl: './currency-conversion-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyConversionDialogComponent implements OnInit {
  private readonly currencyService = inject(CurrencyService);

  readonly visible = input(false);
  readonly saving = input(false);
  readonly result = input<BalanceConversionResponse | null>(null);
  readonly error = input<string | null>(null);

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

  constructor() {
    effect(() => {
      if (!this.visible()) {
        this.selectedCurrency.set('');
      }
    });
  }

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
