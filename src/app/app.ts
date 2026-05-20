import { Component } from '@angular/core';
import { AppShellComponent } from './shared/components/app-shell.component';

@Component({
  selector: 'app-root',
  imports: [AppShellComponent],
  template: '<app-shell />',
  styleUrl: './app.css',
})
export class App {}
