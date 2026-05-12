import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Account,
  BalanceConversionResponse,
  BalanceResponse,
  ConversionKind,
} from '../models/banking.models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly basePath = '/accounts';

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.basePath);
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
}
