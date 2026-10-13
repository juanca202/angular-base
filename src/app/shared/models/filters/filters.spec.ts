import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectHarness } from '@angular/material/select/testing';

import type {
  DateRangeValue,
  DropdownFilterItem,
  FilterAction,
  FilterItem,
  FilterValue,
  FilterValues
} from '@/shared/models/filters';
import { Filters } from './filters';

/** Typed escape hatch to reach protected/private members from whitebox tests. */
type FiltersInternals = {
  values(): FilterValues;
  setValue(id: string, value: FilterValue): void;
  onDateRangeChange(item: FilterItem, patch: Partial<DateRangeValue>): void;
};

function internals(component: Filters): FiltersInternals {
  return component as unknown as FiltersInternals;
}

describe('Filters', () => {
  let fixture: ComponentFixture<Filters>;
  let component: Filters;
  let element: HTMLElement;
  let loader: HarnessLoader;

  async function setItems(items: FilterItem[], initialValues?: FilterValues): Promise<void> {
    fixture.componentRef.setInput('items', items);
    if (initialValues) {
      fixture.componentRef.setInput('initialValues', initialValues);
    }
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Filters],
      // Same Environment Injector provider as `app.config.ts`: the calendar overlay
      // does not see a component-level MatNativeDateModule (NG0201).
      providers: [provideNativeDateAdapter()]
    }).compileComponents();

    fixture = TestBed.createComponent(Filters);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', async () => {
    await setItems([]);
    expect(component).toBeTruthy();
  });

  // AC-001 / AC-002 — rendering
  describe('rendering', () => {
    it('renders one control per item, in order, reflecting the properties of its type (TC-001, TC-003)', async () => {
      await setItems([
        { id: 'b', type: 'button', label: 'Refrescar' },
        { id: 'q', type: 'text', label: 'Buscar', placeholder: 'Nombre' },
        {
          id: 'estado',
          type: 'dropdown',
          label: 'Estado',
          options: [{ label: 'Activo', value: 'active' }]
        },
        { id: 'fechas', type: 'date-range', label: 'Fechas' }
      ]);

      const controls = Array.from(
        element.querySelectorAll('[data-testid^="filter-"]')
      ) as HTMLElement[];
      const ids = controls.map((el) => el.getAttribute('data-testid'));

      expect(ids).toEqual([
        'filter-b',
        'filter-q',
        'filter-estado',
        'filter-fechas-from',
        'filter-fechas-to'
      ]);

      const textInput = element.querySelector('[data-testid="filter-q"]') as HTMLInputElement;
      expect(textInput.placeholder).toBe('Nombre');
    });

    it('opens the calendar overlay when the datepicker icon is clicked', async () => {
      await setItems([{ id: 'fechas', type: 'date-range', label: 'Fechas' }]);

      const toggle = element.querySelector('mat-datepicker-toggle button') as HTMLButtonElement;
      toggle.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.querySelector('mat-calendar')).not.toBeNull();
    });

    it('does not render any control and does not throw when items is empty (TC-002)', async () => {
      await setItems([]);
      expect(element.querySelectorAll('[data-testid^="filter-"]').length).toBe(0);
    });

    it('applies fieldClass to the form-field and to the button', async () => {
      await setItems([
        { id: 'q', type: 'text', label: 'Buscar', fieldClass: 'max-w-sm' },
        { id: 'exportar', type: 'button', label: 'Exportar', fieldClass: 'ms-auto' }
      ]);

      expect(element.querySelector('mat-form-field')?.classList.contains('max-w-sm')).toBe(true);
      expect(
        element.querySelector('[data-testid="filter-exportar"]')?.classList.contains('ms-auto')
      ).toBe(true);
    });
  });

  // AC-003 / AC-004 — combined filtersChange, with debounce on text
  describe('filtersChange', () => {
    it('emits the combined values of all data-capture filters on any change (TC-004)', async () => {
      await setItems([
        { id: 'q', type: 'text', label: 'Buscar' },
        {
          id: 'estado',
          type: 'dropdown',
          label: 'Estado',
          options: [
            { label: 'Activo', value: 'active' },
            { label: 'Inactivo', value: 'inactive' }
          ]
        }
      ]);
      internals(component).setValue('q', 'abc');

      const emitted: FilterValues[] = [];
      component.filtersChange.subscribe((value) => emitted.push(value));

      const select = await loader.getHarness(
        MatSelectHarness.with({ selector: '[data-testid="filter-estado"]' })
      );
      await select.open();
      await select.clickOptions({ text: 'Inactivo' });

      expect(emitted.at(-1)).toEqual({ q: 'abc', estado: 'inactive' });
    });

    it('does not emit filtersChange spontaneously on mount, without interaction (TC-005)', async () => {
      const emitted: FilterValues[] = [];
      await setItems([
        { id: 'q', type: 'text', label: 'Buscar' },
        {
          id: 'estado',
          type: 'dropdown',
          label: 'Estado',
          options: [{ label: 'Activo', value: 'active' }]
        }
      ]);
      component.filtersChange.subscribe((value) => emitted.push(value));
      fixture.detectChanges();

      expect(emitted.length).toBe(0);
    });

    it('debounces the text filter, emitting once with the final value (TC-006)', async () => {
      await setItems([{ id: 'q', type: 'text', label: 'Buscar' }]);
      const emitted: FilterValues[] = [];
      component.filtersChange.subscribe((value) => emitted.push(value));

      vi.useFakeTimers();
      try {
        const input = element.querySelector('[data-testid="filter-q"]') as HTMLInputElement;
        for (const partial of ['a', 'ab', 'abc']) {
          input.value = partial;
          input.dispatchEvent(new Event('input'));
          vi.advanceTimersByTime(100);
        }
        vi.advanceTimersByTime(300);
      } finally {
        vi.useRealTimers();
      }

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toEqual({ q: 'abc' });
    });

    it('emits once per pause beyond the debounce window (TC-007)', async () => {
      await setItems([{ id: 'q', type: 'text', label: 'Buscar' }]);
      const emitted: FilterValues[] = [];
      component.filtersChange.subscribe((value) => emitted.push(value));

      vi.useFakeTimers();
      try {
        const input = element.querySelector('[data-testid="filter-q"]') as HTMLInputElement;
        input.value = 'a';
        input.dispatchEvent(new Event('input'));
        vi.advanceTimersByTime(300);

        input.value = 'ab';
        input.dispatchEvent(new Event('input'));
        vi.advanceTimersByTime(300);
      } finally {
        vi.useRealTimers();
      }

      expect(emitted).toEqual([{ q: 'a' }, { q: 'ab' }]);
    });
  });

  // AC-005 / AC-010 — action payload and its `valid` flag
  describe('action', () => {
    it('emits { id, values, valid: true } for a button and never touches filtersChange (TC-008)', async () => {
      await setItems([
        { id: 'q', type: 'text', label: 'Buscar' },
        { id: 'exportar', type: 'button', label: 'Exportar' }
      ]);
      const actions: FilterAction[] = [];
      const filtersChanges: FilterValues[] = [];
      component.action.subscribe((value) => actions.push(value));
      component.filtersChange.subscribe((value) => filtersChanges.push(value));

      (element.querySelector('[data-testid="filter-exportar"]') as HTMLButtonElement).click();

      expect(actions).toEqual([{ id: 'exportar', values: { q: '' }, valid: true }]);
      expect(filtersChanges.length).toBe(0);
    });

    it('emits the id of the pressed button, not the other one (TC-009)', async () => {
      await setItems([
        { id: 'exportar', type: 'button', label: 'Exportar' },
        { id: 'refrescar', type: 'button', label: 'Refrescar' }
      ]);
      const actions: FilterAction[] = [];
      component.action.subscribe((value) => actions.push(value));

      (element.querySelector('[data-testid="filter-refrescar"]') as HTMLButtonElement).click();

      expect(actions).toEqual([{ id: 'refrescar', values: {}, valid: true }]);
    });

    it('valid is true when every required item is complete (TC-018)', async () => {
      await setItems(
        [
          { id: 'q', type: 'text', label: 'Buscar', required: true },
          {
            id: 'estado',
            type: 'dropdown',
            label: 'Estado',
            required: true,
            options: [{ label: 'Activo', value: 'active' }]
          },
          { id: 'exportar', type: 'button', label: 'Exportar' }
        ],
        { q: 'abc', estado: 'active' }
      );
      const actions: FilterAction[] = [];
      component.action.subscribe((value) => actions.push(value));

      (element.querySelector('[data-testid="filter-exportar"]') as HTMLButtonElement).click();

      expect(actions[0].valid).toBe(true);
    });

    it('valid is false when a required dropdown has no selection (TC-019)', async () => {
      await setItems([
        {
          id: 'estado',
          type: 'dropdown',
          label: 'Estado',
          required: true,
          options: [{ label: 'Activo', value: 'active' }]
        },
        { id: 'exportar', type: 'button', label: 'Exportar' }
      ]);
      const actions: FilterAction[] = [];
      component.action.subscribe((value) => actions.push(value));

      (element.querySelector('[data-testid="filter-exportar"]') as HTMLButtonElement).click();

      expect(actions[0]).toEqual({ id: 'exportar', values: { estado: undefined }, valid: false });
    });

    it('valid is false when a required date-range only has one date set (TC-020)', async () => {
      await setItems([
        { id: 'fechas', type: 'date-range', label: 'Fechas', required: true },
        { id: 'exportar', type: 'button', label: 'Exportar' }
      ]);
      internals(component).onDateRangeChange(
        { id: 'fechas', type: 'date-range', label: 'Fechas', required: true },
        { from: new Date('2026-01-01') }
      );

      const actions: FilterAction[] = [];
      component.action.subscribe((value) => actions.push(value));
      (element.querySelector('[data-testid="filter-exportar"]') as HTMLButtonElement).click();

      expect(actions[0].valid).toBe(false);
    });
  });

  // AC-009 — required: asterisk on the label
  describe('required', () => {
    it('shows the asterisk on a required text item (TC-015)', async () => {
      await setItems([{ id: 'q', type: 'text', label: 'Buscar', required: true }]);

      expect(element.querySelector('mat-label')?.textContent).toContain('*');
    });

    it('shows the asterisk on a required dropdown (TC-016)', async () => {
      await setItems([
        {
          id: 'estado',
          type: 'dropdown',
          label: 'Estado',
          required: true,
          options: [{ label: 'Activo', value: 'active' }]
        }
      ]);

      expect(element.querySelector('mat-label')?.textContent).toContain('*');
    });

    it('shows the asterisk on a required date-range (TC-017)', async () => {
      await setItems([{ id: 'fechas', type: 'date-range', label: 'Fechas', required: true }]);

      expect(element.querySelector('mat-label')?.textContent).toContain('*');
    });
  });

  // AC-006 — initial values
  describe('initialValues', () => {
    it('preloads the data-capture filters from initialValues on mount (TC-010)', async () => {
      await setItems(
        [
          { id: 'q', type: 'text', label: 'Buscar' },
          {
            id: 'estado',
            type: 'dropdown',
            label: 'Estado',
            options: [{ label: 'Activo', value: 'active' }]
          }
        ],
        { q: 'abc', estado: 'active' }
      );

      const textInput = element.querySelector('[data-testid="filter-q"]') as HTMLInputElement;
      expect(textInput.value).toBe('abc');
      expect(internals(component).values()['estado']).toBe('active');
    });

    it('starts empty, without error, when initialValues is not provided (TC-011)', async () => {
      await setItems([
        { id: 'q', type: 'text', label: 'Buscar' },
        {
          id: 'estado',
          type: 'dropdown',
          label: 'Estado',
          options: [{ label: 'Activo', value: 'active' }]
        }
      ]);

      const textInput = element.querySelector('[data-testid="filter-q"]') as HTMLInputElement;
      expect(textInput.value).toBe('');
      expect(internals(component).values()['estado']).toBeUndefined();
    });
  });

  // AC-007 — dropdown default option
  describe('dropdown default option', () => {
    it("preselects defaultOption's value when the user has not chosen otherwise (TC-012)", async () => {
      const item: DropdownFilterItem = {
        id: 'estado',
        type: 'dropdown',
        label: 'Estado',
        options: [
          { label: 'Activo', value: 'active' },
          { label: 'Inactivo', value: 'inactive' }
        ],
        defaultOption: { label: 'Todos', value: 'all' }
      };
      await setItems([item]);

      expect(internals(component).values()['estado']).toBe('all');
    });

    it('is undefined when there is no defaultOption and no selection (TC-013)', async () => {
      await setItems([
        {
          id: 'estado',
          type: 'dropdown',
          label: 'Estado',
          options: [{ label: 'Activo', value: 'active' }]
        }
      ]);

      expect(internals(component).values()['estado']).toBeUndefined();
    });
  });
});
