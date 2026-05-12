import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'accounts',
  },
  {
    path: 'accounts',
    loadComponent: () =>
      import('./features/accounts/accounts-page.component').then((m) => m.AccountsPageComponent),
  },
  {
    path: 'accounts/:id',
    loadComponent: () =>
      import('./features/account-detail/account-detail.component').then(
        (m) => m.AccountDetailComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'accounts',
  },
];
