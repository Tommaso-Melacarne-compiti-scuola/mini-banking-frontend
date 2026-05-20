import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

type TransactionFormGroup = FormGroup<{
  amount: FormControl<number>;
  description: FormControl<string>;
}>;

@Component({
  selector: 'app-transaction-dialog',
  imports: [ButtonModule, DialogModule, InputTextModule, ReactiveFormsModule],
  template: `
    <p-dialog
      [visible]="visible()"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: 'min(42rem, 95vw)' }"
      [header]="title()"
    >
      <form class="space-y-5" [formGroup]="form()" (ngSubmit)="save.emit()">
        <label class="block space-y-2 text-sm font-medium text-slate-700">
          Amount
          <input
            pInputText
            type="number"
            formControlName="amount"
            min="0.01"
            step="0.01"
            [readonly]="editing()"
            class="w-full rounded-2xl"
          />
        </label>

        <label class="block space-y-2 text-sm font-medium text-slate-700">
          Description
          <input pInputText type="text" formControlName="description" class="w-full rounded-2xl" />
        </label>

        <div class="flex items-center justify-end gap-3 pt-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            type="button"
            (onClick)="dismiss.emit()"
          />
          <p-button label="Save" icon="pi pi-check" type="submit" [loading]="saving()" />
        </div>
      </form>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionDialogComponent {
  readonly visible = input(false);
  readonly title = input.required<string>();
  readonly editing = input(false);
  readonly saving = input(false);
  readonly form = input.required<TransactionFormGroup>();

  readonly visibleChange = output<boolean>();
  readonly save = output<void>();
  readonly dismiss = output<void>();
}
