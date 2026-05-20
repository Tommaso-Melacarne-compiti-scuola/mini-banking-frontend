import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CurrencyInfo {
  code: string;
  name: string;
  isCrypto: boolean;
}

interface BinanceExchangeInfo {
  symbols: {
    symbol: string;
    status: string;
    baseAsset: string;
    quoteAsset: string;
  }[];
}

const CRYPTO_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  BNB: 'Binance Coin',
  XRP: 'XRP',
  ADA: 'Cardano',
  USDC: 'USD Coin',
  SOL: 'Solana',
  DOT: 'Polkadot',
  DOGE: 'Dogecoin',
  MATIC: 'Polygon',
  LINK: 'Chainlink',
  LTC: 'Litecoin',
  BCH: 'Bitcoin Cash',
  SHIB: 'Shiba Inu',
  AVAX: 'Avalanche',
  DAI: 'Dai',
  WBTC: 'Wrapped Bitcoin',
  TRX: 'TRON',
  UNI: 'Uniswap',
};

interface FrankfurterResponse {
  currencies: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly http = inject(HttpClient);
  private readonly frankfurterBaseUrl = 'https://api.frankfurter.app';
  private readonly binanceBaseUrl = 'https://api.binance.com/api/v3';

  /**
   * Fetches available currencies from Frankfurter (fiat) and Binance (crypto)
   * @returns Observable of available currencies sorted by code
   */
  getAvailableCurrencies(): Observable<CurrencyInfo[]> {
    const fiat$ = this.http.get<FrankfurterResponse>(`${this.frankfurterBaseUrl}/currencies`).pipe(
      map((response) => response.currencies),
      catchError(() =>
        of({
          USD: 'US Dollar',
          EUR: 'Euro',
          GBP: 'British Pound',
          JPY: 'Japanese Yen',
          CHF: 'Swiss Franc',
          CAD: 'Canadian Dollar',
          AUD: 'Australian Dollar',
        }),
      ),
    );

    const crypto$ = this.http.get<BinanceExchangeInfo>(`${this.binanceBaseUrl}/exchangeInfo`).pipe(
      map((response) =>
        response.symbols
          .filter((s) => s.quoteAsset === 'EUR' && s.status === 'TRADING')
          .map((s) => ({
            code: s.baseAsset,
            name: CRYPTO_NAMES[s.baseAsset] || s.baseAsset,
            isCrypto: true,
          })),
      ),
      catchError(() =>
        of([
          { code: 'BTC', name: 'Bitcoin', isCrypto: true },
          { code: 'ETH', name: 'Ethereum', isCrypto: true },
          { code: 'USDT', name: 'Tether', isCrypto: true },
        ]),
      ),
    );

    return forkJoin({ fiat: fiat$, crypto: crypto$ }).pipe(
      map(({ fiat, crypto }) => {
        const fiatList: CurrencyInfo[] = Object.entries(fiat).map(([code, name]) => ({
          code,
          name: name as string,
          isCrypto: false,
        }));

        // Combine and remove duplicates
        const combined = [...fiatList, ...crypto];
        const unique = Array.from(new Map(combined.map((c) => [c.code, c])).values());

        return unique.sort((a, b) => a.code.localeCompare(b.code));
      }),
    );
  }

  /**
   * Determine if a currency is cryptocurrency
   */
  isCryptoCurrency(code: string): boolean {
    return CRYPTO_NAMES.hasOwnProperty(code.toUpperCase());
  }
}
