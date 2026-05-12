import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Transaction,
  TransactionCreatePayload,
  TransactionUpdatePayload,
} from '../models/banking.models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly basePath = '/accounts';

  getTransactions(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.basePath}/${accountId}/transactions`);
  }

  getTransaction(accountId: number, transactionId: number): Observable<Transaction> {
    return this.http.get<Transaction>(
      `${this.basePath}/${accountId}/transactions/${transactionId}`,
    );
  }

  createDeposit(accountId: number, payload: TransactionCreatePayload): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.basePath}/${accountId}/deposits`, payload);
  }

  createWithdrawal(accountId: number, payload: TransactionCreatePayload): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.basePath}/${accountId}/withdrawals`, payload);
  }

  updateDescription(
    accountId: number,
    transactionId: number,
    payload: TransactionUpdatePayload,
  ): Observable<Transaction> {
    return this.http.put<Transaction>(
      `${this.basePath}/${accountId}/transactions/${transactionId}`,
      payload,
    );
  }

  deleteTransaction(accountId: number, transactionId: number): Observable<void> {
    return this.http.delete<void>(`${this.basePath}/${accountId}/transactions/${transactionId}`);
  }
}
