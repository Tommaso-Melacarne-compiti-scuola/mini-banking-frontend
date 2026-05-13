export type TransactionType = 'deposit' | 'withdrawal';
export type ConversionKind = 'fiat' | 'crypto';

export interface Account {
  id: number;
  ownerName?: string;
  createdAt?: string;
  name?: string;
  owner?: string;
  number?: string;
  iban?: string;
  currency?: string;
  balance?: number;
  [key: string]: unknown;
}

export interface AccountApiItem {
  id: string | number;
  owner_name: string;
  currency: string;
  created_at: string;
  [key: string]: unknown;
}

export interface AccountsApiResponse {
  accounts: AccountApiItem[];
  count: number;
}

export interface Transaction {
  id: number;
  account_id: number;
  type: TransactionType;
  amount: number;
  description: string;
  created_at: string;
}

export interface BalanceResponse {
  account_id: number;
  balance: number;
}

export interface BalanceConversionResponse {
  account_id: number;
  original_balance: number;
  converted_balance: number;
  currency: string;
}

export interface TransactionCreatePayload {
  amount: number;
  description: string;
}

export interface TransactionUpdatePayload {
  description: string;
}
