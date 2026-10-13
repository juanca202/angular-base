import type { MatButtonAppearance } from '@angular/material/button';

import type { Option } from './option';

/** Shared fields of every `FilterItem` variant. */
interface FilterItemBase {
  id: string;
  label: string;
  /** Extra CSS classes for the `mat-form-field`, or for the host button when `type` is `button`. */
  fieldClass?: string;
}

/** Free-text search item; can be marked `required`. */
export interface TextFilterItem extends FilterItemBase {
  type: 'text';
  placeholder?: string;
  required?: boolean;
  /** Optional leading icon (`ft-icon` name) rendered inside the field. */
  icon?: string;
}

/** Single-select item; can be marked `required` and declare a preselected `defaultOption`. */
export interface DropdownFilterItem extends FilterItemBase {
  type: 'dropdown';
  options: Option[];
  defaultOption?: Option;
  required?: boolean;
}

/** Action trigger; has no value of its own, so it cannot be marked `required`. */
export interface ButtonFilterItem extends FilterItemBase {
  type: 'button';
  icon?: string;
  /** Appearance passed to `matButton`. Defaults to `filled` when omitted. */
  buttonAppearance?: MatButtonAppearance;
}

/** From/to date pair; can be marked `required`, which demands both dates. */
export interface DateRangeFilterItem extends FilterItemBase {
  type: 'date-range';
  required?: boolean;
}

/**
 * Discriminated union (by `type`) of the filter items `app-filters` can render.
 * Adding a new variant must not require changes in existing consumers.
 */
export type FilterItem =
  | TextFilterItem
  | DropdownFilterItem
  | ButtonFilterItem
  | DateRangeFilterItem;

export interface DateRangeValue {
  from?: Date;
  to?: Date;
}

export type FilterValue = string | DateRangeValue;

/** Current values of the data-capture filters (`text`, `dropdown`, `date-range`), keyed by item id. */
export type FilterValues = Record<string, FilterValue>;

/** Payload emitted by `app-filters`'s `action` output when a `button` item is pressed. */
export interface FilterAction {
  id: string;
  values: FilterValues;
  valid: boolean;
}
