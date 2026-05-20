import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterOutlet, ToastModule],
  template: `
    <div
      class="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_34%),linear-gradient(180deg,#07111f_0%,#091627_45%,#f4f7fb_45%,#f4f7fb_100%)] text-slate-900"
    >
      <p-toast />

      <header
        class="mx-auto flex w-full items-center justify-center gap-4 px-4 py-6 sm:px-6 lg:px-8"
      >
        <a
          routerLink="/accounts"
          class="inline-flex items-center gap-3 text-white"
          aria-label="Mini Banking home"
        >
          <span class="block text-3xl font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Mini Banking
          </span>
        </a>
      </header>

      <main class="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <router-outlet />
      </main>
    </div>
  `,
  providers: [MessageService],
})
export class AppShellComponent {}
