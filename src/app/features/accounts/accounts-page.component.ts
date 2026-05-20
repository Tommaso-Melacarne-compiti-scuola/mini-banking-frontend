import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';

import { Account } from '../../core/models/banking.models';
import { AccountService } from '../../core/services/account.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';
import { StateMessageComponent } from '../../shared/components/state-message.component';

@Component({
  selector: 'app-accounts-page',
  imports: [
    ButtonModule,
    DividerModule,
    PageHeaderComponent,
    RouterLink,
    SkeletonGridComponent,
    StateMessageComponent,
  ],
  templateUrl: './accounts-page.component.html',
  styleUrl: './accounts-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsPageComponent {
  private readonly accountService = inject(AccountService);
  private readonly messageService = inject(MessageService);
  private loadSequence = 0;

  readonly accounts = signal<Account[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly hasAccounts = computed(() => this.accounts().length > 0);

  constructor() {
    this.loadAccounts();
  }

  reload(): void {
    this.loadAccounts();
  }

  accountLabel(account: Account): string {
    return (
      account.ownerName ?? account.name ?? account.owner ?? account.iban ?? `Account #${account.id}`
    );
  }

  getAccountCreationDate(account: Account): string {
    if (!account.createdAt) {
      return 'Unknown date';
    }

    const date = new Date(account.createdAt);

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private loadAccounts(): void {
    const currentLoad = ++this.loadSequence;
    this.loading.set(true);
    this.error.set(null);

    this.accountService
      .getAccounts()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (accounts) => {
          if (currentLoad !== this.loadSequence) {
            return;
          }

          this.accounts.set(accounts);
        },
        error: () => {
          if (currentLoad !== this.loadSequence) {
            return;
          }

          this.accounts.set([]);
          const message = 'Unable to load accounts. Check that the backend is running.';
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
