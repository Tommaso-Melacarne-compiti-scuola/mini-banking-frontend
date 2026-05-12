import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

import {
  Account,
  BalanceConversionResponse,
  BalanceResponse,
  ConversionKind,
  Transaction,
} from '../../core/models/banking.models';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';

@Component({
  selector: 'app-account-detail',
  imports: [
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DatePipe,
    DecimalPipe,
    DialogModule,
    DividerModule,
    InputTextModule,
    ReactiveFormsModule,
    RouterLink,
    TableModule,
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

  readonly accountId = Number(this.route.snapshot.paramMap.get('id'));
  readonly account = signal<Account | null>(null);
  readonly transactions = signal<Transaction[]>([]);
  readonly balance = signal<BalanceResponse | null>(null);
  readonly conversion = signal<BalanceConversionResponse | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly transactionDialogVisible = signal(false);
  readonly transactionDialogMode = signal<'deposit' | 'withdrawal' | 'edit'>('deposit');
  readonly selectedTransaction = signal<Transaction | null>(null);
  readonly conversionKind = signal<ConversionKind>('fiat');

  readonly balanceForm = this.formBuilder.nonNullable.group({
    to: ['USD', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
  });

  readonly transactionForm = this.formBuilder.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    description: ['', [Validators.required, Validators.minLength(3)]],
  });

  readonly accountLabel = computed(() => {
    const account = this.account();
    if (!account) {
      return `Account #${this.accountId}`;
    }

    return account.name ?? account.owner ?? account.iban ?? `Account #${account.id}`;
  });

  readonly accountSubtitle = computed(() => {
    const account = this.account();
    if (!account) {
      return 'Loading account';
    }

    const details = [account.number, account.currency].filter(Boolean);
    return details.length > 0 ? details.join(' · ') : 'Account details';
  });

  readonly totalTransactions = computed(() => this.transactions().length);

  constructor() {
    this.loadData();
  }

  openTransactionDialog(mode: 'deposit' | 'withdrawal', transaction?: Transaction): void {
    this.transactionDialogMode.set(mode);
    this.selectedTransaction.set(transaction ?? null);
    this.transactionForm.reset({ amount: 0, description: transaction?.description ?? '' });

    if (transaction) {
      this.transactionForm.controls.amount.disable();
    } else {
      this.transactionForm.controls.amount.enable();
    }

    this.transactionDialogVisible.set(true);
  }

  closeTransactionDialog(): void {
    this.transactionDialogVisible.set(false);
    this.selectedTransaction.set(null);
    this.transactionForm.controls.amount.enable();
    this.transactionForm.reset({ amount: 0, description: '' });
  }

  saveTransaction(): void {
    if (this.transactionForm.invalid || this.saving()) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const description = this.transactionForm.controls.description.value.trim();
    const amount = this.transactionForm.controls.amount.getRawValue();
    const transaction = this.selectedTransaction();

    this.saving.set(true);
    this.error.set(null);

    const request$ =
      transaction !== null
        ? this.transactionService.updateDescription(this.accountId, transaction.id, { description })
        : this.transactionDialogMode() === 'deposit'
          ? this.transactionService.createDeposit(this.accountId, { amount, description })
          : this.transactionService.createWithdrawal(this.accountId, { amount, description });

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.closeTransactionDialog();
        this.loadData();
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
        this.saving.set(true);
        this.error.set(null);

        this.transactionService
          .deleteTransaction(this.accountId, transaction.id)
          .pipe(finalize(() => this.saving.set(false)))
          .subscribe({
            next: () => {
              this.loadData();
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

  convertBalance(kind: ConversionKind): void {
    if (this.balanceForm.invalid || this.saving()) {
      this.balanceForm.markAllAsTouched();
      return;
    }

    const to = this.balanceForm.controls.to.value.trim().toUpperCase();
    this.conversionKind.set(kind);
    this.saving.set(true);
    this.error.set(null);

    this.accountService
      .convertBalance(this.accountId, kind, to)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (result) => {
          this.conversion.set(result);
          this.messageService.add({
            severity: 'success',
            summary: 'Converted',
            detail: `Balance converted to ${result.currency}.`,
            life: 3000,
          });
        },
        error: () => {
          const message = 'Balance conversion failed.';
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

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.accountService.getBalance(this.accountId).subscribe({
      next: (balance) => this.balance.set(balance),
      error: () => this.balance.set(null),
    });

    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        const account = accounts.find((item) => item.id === this.accountId) ?? null;
        this.account.set(account);
      },
      error: () => this.account.set(null),
    });

    this.transactionService
      .getTransactions(this.accountId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (transactions) => this.transactions.set(transactions),
        error: () => {
          this.transactions.set([]);
          const message = 'The transactions list could not be loaded.';
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
