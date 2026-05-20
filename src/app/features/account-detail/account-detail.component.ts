import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

import {
  Account,
  BalanceConversionResponse,
  BalanceResponse,
  Transaction,
} from '../../core/models/banking.models';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StateMessageComponent } from '../../shared/components/state-message.component';
import { AccountBalanceCardComponent } from './components/account-balance-card.component';
import { CurrencyConversionDialogComponent } from './components/currency-conversion-dialog/currency-conversion-dialog.component';
import { TransactionDialogComponent } from './components/transaction-dialog.component';
import { TransactionHistoryTableComponent } from './components/transaction-history-table.component';

@Component({
  selector: 'app-account-detail',
  imports: [
    ButtonModule,
    AccountBalanceCardComponent,
    ConfirmDialogModule,
    CurrencyConversionDialogComponent,
    DividerModule,
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    StateMessageComponent,
    TransactionDialogComponent,
    TransactionHistoryTableComponent,
  ],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService],
})
export class AccountDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly accountService = inject(AccountService);
  private readonly transactionService = inject(TransactionService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private loadSequence = 0;

  readonly accountId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    {
      initialValue: Number(this.route.snapshot.paramMap.get('id')),
    },
  );
  readonly account = signal<Account | null>(null);
  readonly transactions = signal<Transaction[]>([]);
  readonly balance = signal<BalanceResponse | null>(null);
  readonly loading = signal(true);
  readonly transactionSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly transactionDialogVisible = signal(false);
  readonly transactionDialogMode = signal<'deposit' | 'withdrawal' | 'edit'>('deposit');
  readonly selectedTransaction = signal<Transaction | null>(null);
  readonly currencyConversionDialogVisible = signal(false);
  readonly currencyConversionSaving = signal(false);
  readonly currencyConversionResult = signal<BalanceConversionResponse | null>(null);
  readonly currencyConversionError = signal<string | null>(null);

  readonly transactionForm = this.formBuilder.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    description: ['', [Validators.required, Validators.minLength(3)]],
  });

  readonly accountLabel = computed(() => {
    const account = this.account();
    if (!account) {
      return `Account #${this.accountId()}`;
    }

    return (
      account.ownerName ?? account.name ?? account.owner ?? account.iban ?? `Account #${account.id}`
    );
  });

  readonly accountSubtitle = computed(() => {
    const account = this.account();
    if (!account) {
      return 'Loading account';
    }

    const details = [account.number, account.currency].filter(Boolean);
    if (details.length > 0) {
      return details.join(' · ');
    }

    if (account.createdAt) {
      return `Created on ${account.createdAt}`;
    }

    return 'Account details';
  });

  readonly totalTransactions = computed(() => this.transactions().length);

  readonly transactionDialogTitle = computed(() => {
    if (this.transactionDialogMode() === 'edit') {
      return 'Edit description';
    }

    return this.transactionDialogMode() === 'deposit' ? 'Register deposit' : 'Register withdrawal';
  });

  readonly isEditingTransaction = computed(() => this.transactionDialogMode() === 'edit');

  constructor() {
    effect(() => {
      const accountId = this.accountId();

      if (!Number.isFinite(accountId) || accountId <= 0) {
        this.account.set(null);
        this.transactions.set([]);
        this.balance.set(null);
        this.loading.set(false);
        this.error.set('The account identifier is invalid.');
        return;
      }

      this.loadData(accountId);
    });
  }

  openTransactionDialog(mode: 'deposit' | 'withdrawal'): void {
    this.transactionDialogMode.set(mode);
    this.selectedTransaction.set(null);
    this.transactionForm.controls.amount.enable();
    this.transactionForm.reset({ amount: 0, description: '' });
    this.transactionDialogVisible.set(true);
  }

  openEditTransactionDialog(transaction: Transaction): void {
    this.transactionDialogMode.set('edit');
    this.selectedTransaction.set(transaction);
    this.transactionForm.reset({
      amount: transaction.amount,
      description: transaction.description,
    });
    this.transactionForm.controls.amount.disable();
    this.transactionDialogVisible.set(true);
  }

  closeTransactionDialog(): void {
    this.transactionDialogVisible.set(false);
    this.selectedTransaction.set(null);
    this.transactionDialogMode.set('deposit');
    this.transactionForm.controls.amount.enable();
    this.transactionForm.reset({ amount: 0, description: '' });
  }

  saveTransaction(): void {
    if (this.transactionForm.invalid || this.transactionSaving()) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const description = this.transactionForm.controls.description.value.trim();
    const amount = this.transactionForm.controls.amount.getRawValue();
    const transaction = this.selectedTransaction();
    const accountId = this.accountId();

    this.transactionSaving.set(true);
    this.error.set(null);

    const request$ =
      transaction !== null
        ? this.transactionService.updateDescription(accountId, transaction.id, { description })
        : this.transactionDialogMode() === 'deposit'
          ? this.transactionService.createDeposit(accountId, { amount, description })
          : this.transactionService.createWithdrawal(accountId, { amount, description });

    request$.pipe(finalize(() => this.transactionSaving.set(false))).subscribe({
      next: () => {
        this.closeTransactionDialog();
        this.loadData(accountId);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Transaction saved successfully.',
          life: 3000,
        });
      },
      error: () => {
        const message = 'The transaction could not be saved.';
        this.error.set(message);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message,
          life: 5000,
        });
      },
    });
  }

  confirmDelete(transaction: Transaction): void {
    this.confirmationService.confirm({
      header: 'Delete transaction',
      icon: 'pi pi-exclamation-triangle',
      message: `Delete transaction #${transaction.id}? This cannot be undone.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const accountId = this.accountId();
        this.transactionSaving.set(true);
        this.error.set(null);

        this.transactionService
          .deleteTransaction(accountId, transaction.id)
          .pipe(finalize(() => this.transactionSaving.set(false)))
          .subscribe({
            next: () => {
              this.loadData(accountId);
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Transaction deleted successfully.',
                life: 3000,
              });
            },
            error: () => {
              const message = 'The transaction could not be deleted.';
              this.error.set(message);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: message,
                life: 5000,
              });
            },
          });
      },
    });
  }

  openCurrencyConversionDialog(): void {
    this.currencyConversionError.set(null);
    this.currencyConversionResult.set(null);
    this.currencyConversionDialogVisible.set(true);
  }

  closeCurrencyConversionDialog(): void {
    this.currencyConversionDialogVisible.set(false);
    this.currencyConversionResult.set(null);
    this.currencyConversionError.set(null);
  }

  convertBalanceFromDialog(event: { currency: string; kind: 'fiat' | 'crypto' }): void {
    this.currencyConversionSaving.set(true);
    this.currencyConversionError.set(null);
    this.currencyConversionResult.set(null);

    const accountId = this.accountId();

    this.accountService
      .convertBalance(accountId, event.kind, event.currency)
      .pipe(finalize(() => this.currencyConversionSaving.set(false)))
      .subscribe({
        next: (result) => {
          this.currencyConversionResult.set(result);
          this.messageService.add({
            severity: 'success',
            summary: 'Converted',
            detail: `Balance converted to ${result.currency}.`,
            life: 3000,
          });
        },
        error: () => {
          const message = 'Balance conversion failed.';
          this.currencyConversionError.set(message);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 5000,
          });
        },
      });
  }

  private loadData(accountId: number): void {
    const currentLoad = ++this.loadSequence;
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      accounts: this.accountService.getAccounts(),
      balance: this.accountService.getBalance(accountId),
      transactions: this.transactionService.getTransactions(accountId),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ accounts, balance, transactions }) => {
          if (currentLoad !== this.loadSequence) {
            return;
          }

          this.account.set(accounts.find((item) => item.id === accountId) ?? null);
          this.balance.set(balance);
          this.transactions.set(transactions);
        },
        error: () => {
          if (currentLoad !== this.loadSequence) {
            return;
          }

          this.account.set(null);
          this.balance.set(null);
          this.transactions.set([]);
          const message = 'The account data could not be loaded.';
          this.error.set(message);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 5000,
          });
        },
      });
  }
}
