import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  OnDestroy,
  output,
  signal
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Icon } from '@factor_ec/ui';

import type {
  ButtonFilterItem,
  DateRangeFilterItem,
  DateRangeValue,
  DropdownFilterItem,
  FilterAction,
  FilterItem,
  FilterValue,
  FilterValues,
  TextFilterItem
} from '@/shared/models/filters';

/** Debounce (ms) applied to text filter items before emitting `filtersChange`. */
const TEXT_DEBOUNCE_MS = 300;

/**
 * Configurable filter bar: renders one control per `FilterItem` (text, dropdown,
 * button or date range), in the received order, following the shape declared by
 * `items`. Emits the combined values of the data-capture filters through
 * `filtersChange`, and a separate `action` event — carrying the pressed button's
 * id, the current filter values, and their aggregated validity against `required`
 * items — for `button` items.
 */
@Component({
  selector: 'app-filters',
  imports: [
    Icon,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './filters.html',
  styleUrl: './filters.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Filters implements OnDestroy {
  public readonly action = output<FilterAction>();
  private readonly debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  public readonly filtersChange = output<FilterValues>();
  /** Values used to preload the data-capture filters once, when the component mounts. */
  public readonly initialValues = input<FilterValues>();
  public readonly items = input.required<FilterItem[]>();
  private seeded = false;
  /** Current values of the data-capture filters (text, dropdown, date-range). */
  protected readonly values = signal<FilterValues>({});

  constructor() {
    // Seeds `values` once from `initialValues`/`defaultOption`, the first time
    // `items` is available; later changes to the inputs do not reseed it.
    effect(() => {
      const items = this.items();
      const initialValues = this.initialValues();
      if (this.seeded) return;
      this.seeded = true;
      this.values.set(this.buildInitialValues(items, initialValues));
    });
  }

  ngOnDestroy(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
  }

  private buildInitialValues(
    items: FilterItem[],
    initialValues: FilterValues | undefined
  ): FilterValues {
    const seededValues: FilterValues = {};
    for (const item of items) {
      if (item.type === 'button') continue;
      if (initialValues?.[item.id] !== undefined) {
        seededValues[item.id] = initialValues[item.id];
      } else if (item.type === 'dropdown' && item.defaultOption) {
        seededValues[item.id] = item.defaultOption.value;
      } else if (item.type === 'text') {
        seededValues[item.id] = '';
      }
    }
    return seededValues;
  }

  private computeValid(): boolean {
    return this.items().every(
      (item) => item.type === 'button' || !item.required || this.isComplete(item)
    );
  }

  protected dateRangeValue(id: string): DateRangeValue {
    const value = this.values()[id];
    return value && typeof value === 'object' ? value : {};
  }

  protected dropdownValue(id: string): string | undefined {
    const value = this.values()[id];
    return typeof value === 'string' ? value : undefined;
  }

  private isComplete(item: TextFilterItem | DropdownFilterItem | DateRangeFilterItem): boolean {
    const value = this.values()[item.id];
    switch (item.type) {
      case 'text':
        return typeof value === 'string' && value !== '';
      case 'dropdown':
        return value !== undefined;
      case 'date-range': {
        const range = value && typeof value === 'object' ? value : undefined;
        return !!range?.from && !!range?.to;
      }
    }
  }

  protected onAction(item: ButtonFilterItem): void {
    this.action.emit({
      id: item.id,
      values: this.values(),
      valid: this.computeValid()
    });
  }

  protected onDateRangeChange(item: DateRangeFilterItem, patch: Partial<DateRangeValue>): void {
    this.setValue(item.id, { ...this.dateRangeValue(item.id), ...patch });
  }

  protected onDropdownChange(item: DropdownFilterItem, value: string): void {
    this.setValue(item.id, value);
  }

  protected onTextInput(item: TextFilterItem, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    clearTimeout(this.debounceTimers.get(item.id));
    this.debounceTimers.set(
      item.id,
      setTimeout(() => {
        this.debounceTimers.delete(item.id);
        this.setValue(item.id, value);
      }, TEXT_DEBOUNCE_MS)
    );
  }

  private setValue(id: string, value: FilterValue): void {
    this.values.update((current) => ({ ...current, [id]: value }));
    this.filtersChange.emit(this.values());
  }

  protected textValue(id: string): string {
    const value = this.values()[id];
    return typeof value === 'string' ? value : '';
  }
}
