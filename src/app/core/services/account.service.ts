import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs';

import {
  Account,
  AccountApiItem,
  AccountsApiResponse,
  BalanceConversionResponse,
  BalanceResponse,
  ConversionKind,
} from '../models/banking.models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly basePath = '/accounts';

  getAccounts(): Observable<Account[]> {
    return this.http
      .get<AccountsApiResponse>(this.basePath)
      .pipe(map((response) => response.accounts.map((account) => this.normalizeAccount(account))));
  }

  getBalance(accountId: number): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(`${this.basePath}/${accountId}/balance`);
  }

  convertBalance(
    accountId: number,
    kind: ConversionKind,
    to: string,
  ): Observable<BalanceConversionResponse> {
    const params = new HttpParams().set('to', to);
    return this.http.get<BalanceConversionResponse>(
      `${this.basePath}/${accountId}/balance/convert/${kind}`,
      {
        params,
      },
    );
  }

  private normalizeAccount(account: AccountApiItem): Account {
    return {
      ...account,
      id: Number(account.id),
      ownerName: account.owner_name,
      createdAt: account.created_at,
    };
  }
}
