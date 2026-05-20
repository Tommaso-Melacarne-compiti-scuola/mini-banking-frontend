import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import { Transaction } from '../../../core/models/banking.models';

@Component({
  selector: 'app-transaction-history-table',
  imports: [ButtonModule, CardModule, DatePipe, DecimalPipe, TableModule],
  template: `
    <p-card
      class="rounded-4xl border border-slate-200 bg-white/95 shadow-[0_24px_120px_rgba(15,23,42,0.12)] backdrop-blur"
    >
      <ng-template pTemplate="header">
        <div class="border-b border-slate-200 px-5 py-4">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">History</p>
          <h2 class="text-xl font-semibold text-slate-950">Movements</h2>
        </div>
      </ng-template>

      <p-table
        [value]="transactions()"
        [tableStyle]="{ 'min-width': '48rem' }"
        [rowHover]="true"
        class="p-datatable-sm w-full"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Description</th>
            <th class="w-48">Actions</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-transaction>
          <tr>
            <td>{{ transaction.created_at | date: 'medium' }}</td>
            <td class="font-semibold text-slate-700">{{ transaction.type }}</td>
            <td
              class="font-semibold"
              [class.text-emerald-700]="transaction.type === 'deposit'"
              [class.text-rose-700]="transaction.type === 'withdrawal'"
            >
              {{ transaction.amount | number: '1.2-2' }}
            </td>
            <td>{{ transaction.description }}</td>
            <td class="flex items-center justify-center">
              <p-button
                icon="pi pi-pencil"
                severity="secondary"
                text
                [outlined]="true"
                ariaLabel="Edit transaction description"
                (onClick)="edit.emit(transaction)"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                text
                [outlined]="true"
                ariaLabel="Delete transaction"
                (onClick)="delete.emit(transaction)"
              />
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="py-10 text-center text-slate-500">No transactions found.</td>
          </tr>
        </ng-template>
      </p-table>
    </p-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionHistoryTableComponent {
  readonly transactions = input<Transaction[]>([]);
  readonly edit = output<Transaction>();
  readonly delete = output<Transaction>();
}
