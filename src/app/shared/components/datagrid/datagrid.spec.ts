import { describe, it, expect, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatSelectHarness } from '@angular/material/select/testing';

import type { DatagridColumn } from '@/shared/models/datagrid';
import { Datagrid } from './datagrid';
import { DatagridCellDirective } from './datagrid-cell.directive';
import { DatagridHeaderCellDirective } from './datagrid-header-cell.directive';

/** Loosely-typed row used across tests; each test shapes its own fields. */
type Row = Record<string, unknown>;

const DEFAULT_COLUMNS: DatagridColumn<Row>[] = [{ id: 'name', header: 'Nombre' }];

describe('Datagrid', () => {
  let fixture: ComponentFixture<Datagrid<Row>>;
  let component: Datagrid<Row>;
  let element: HTMLElement;
  let loader: HarnessLoader;

  interface SetInputsOptions {
    columns?: DatagridColumn<Row>[];
    data?: readonly Row[];
    total?: number;
    pageIndex?: number;
    pageSize?: number;
    pageSizeOptions?: number[];
    loading?: boolean;
    emptyMessage?: string;
    trackBy?: (row: Row) => unknown;
  }

  async function setInputs(options: SetInputsOptions = {}): Promise<void> {
    fixture.componentRef.setInput('columns', options.columns ?? DEFAULT_COLUMNS);
    fixture.componentRef.setInput('data', options.data ?? []);
    fixture.componentRef.setInput('total', options.total ?? options.data?.length ?? 0);
    if (options.pageIndex !== undefined)
      fixture.componentRef.setInput('pageIndex', options.pageIndex);
    if (options.pageSize !== undefined) fixture.componentRef.setInput('pageSize', options.pageSize);
    if (options.pageSizeOptions !== undefined)
      fixture.componentRef.setInput('pageSizeOptions', options.pageSizeOptions);
    if (options.loading !== undefined) fixture.componentRef.setInput('loading', options.loading);
    if (options.emptyMessage !== undefined)
      fixture.componentRef.setInput('emptyMessage', options.emptyMessage);
    if (options.trackBy !== undefined) fixture.componentRef.setInput('trackBy', options.trackBy);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Datagrid]
    }).compileComponents();

    fixture = TestBed.createComponent<Datagrid<Row>>(Datagrid);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', async () => {
    await setInputs();
    expect(component).toBeTruthy();
  });

  // AC-001 — columns rendered in order, with header text
  describe('columnas (AC-001)', () => {
    it('renders one header cell per column, in the order and text received (TC-001)', async () => {
      await setInputs({
        columns: [
          { id: 'code', header: 'Código' },
          { id: 'name', header: 'Nombre' },
          { id: 'status', header: 'Estado' }
        ],
        data: [{ id: 1 }]
      });

      const headers = Array.from(element.querySelectorAll('[data-testid^="datagrid-header-"]'));
      expect(headers.map((el) => el.getAttribute('data-testid'))).toEqual([
        'datagrid-header-code',
        'datagrid-header-name',
        'datagrid-header-status'
      ]);
      expect(headers.map((el) => el.textContent?.trim())).toEqual(['Código', 'Nombre', 'Estado']);
    });

    it('renders no header cell when columns is empty (TC-002)', async () => {
      await setInputs({ columns: [], data: [{ id: 1 }] });

      expect(element.querySelectorAll('[data-testid^="datagrid-header-"]').length).toBe(0);
    });
  });

  // AC-002 — data/total render one row per element
  describe('filas (AC-002)', () => {
    it('renders exactly one row per element of data (TC-003)', async () => {
      const data = Array.from({ length: 5 }, (_, index) => ({ id: index + 1 }));
      await setInputs({ data, total: 5 });

      expect(element.querySelectorAll('[data-testid="datagrid-row"]').length).toBe(5);
    });

    it('renders exactly one row when data has a single element (TC-004)', async () => {
      await setInputs({ data: [{ id: 1 }], total: 1 });

      expect(element.querySelectorAll('[data-testid="datagrid-row"]').length).toBe(1);
    });
  });

  // AC-003 — plain-text fallback via accessor / row[id]
  describe('texto plano por defecto (AC-003)', () => {
    it('renders the value returned by accessor(row) when no appDatagridCell template matches (TC-005)', async () => {
      await setInputs({
        columns: [
          {
            id: 'fullName',
            header: 'Nombre',
            accessor: (row) => `${row['first']} ${row['last']}`
          }
        ],
        data: [{ first: 'Ada', last: 'Lovelace' }]
      });

      const cell = element.querySelector('[data-testid="datagrid-cell-fullName"]');
      expect(cell?.textContent?.trim()).toBe('Ada Lovelace');
    });

    it('falls back to row[id] when the column has no accessor (TC-006)', async () => {
      await setInputs({
        columns: [{ id: 'name', header: 'Nombre' }],
        data: [{ name: 'Grace Hopper' }]
      });

      const cell = element.querySelector('[data-testid="datagrid-cell-name"]');
      expect(cell?.textContent?.trim()).toBe('Grace Hopper');
    });
  });

  // AC-004 / AC-005 — appDatagridCell customization and its no-op fallback
  describe('personalización de celda (AC-004, AC-005)', () => {
    it('renders the projected appDatagridCell template instead of plain text (TC-007)', async () => {
      // Satisfies the outer (unused-in-this-test) fixture's required inputs: this
      // app is zoneless, and `whenStable()` below settles application-wide, which
      // would otherwise re-render the still-uninitialized outer `fixture`.
      await setInputs();

      @Component({
        standalone: true,
        imports: [Datagrid, DatagridCellDirective],
        template: `
          <app-datagrid [columns]="columns" [data]="data" [total]="data.length">
            <ng-template appDatagridCell="status" let-row>
              <span class="badge" [attr.data-testid]="'badge-' + row.id">{{
                row.status === 'active' ? 'Activo' : 'Inactivo'
              }}</span>
            </ng-template>
          </app-datagrid>
        `
      })
      class MatchingCellHost {
        public columns: DatagridColumn<Row>[] = [{ id: 'status', header: 'Estado' }];
        public data: Row[] = [
          { id: 1, status: 'active' },
          { id: 2, status: 'inactive' }
        ];
      }

      const hostFixture = TestBed.createComponent(MatchingCellHost);
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      hostFixture.detectChanges();
      const hostElement = hostFixture.nativeElement as HTMLElement;

      expect(hostElement.querySelector('[data-testid="badge-1"]')?.textContent?.trim()).toBe(
        'Activo'
      );
      expect(hostElement.querySelector('[data-testid="badge-2"]')?.textContent?.trim()).toBe(
        'Inactivo'
      );
      expect(
        hostElement.querySelector('[data-testid="datagrid-cell-status"]')?.textContent
      ).not.toContain('active');
    });

    it('does not error and renders the rest of the columns when a projected appDatagridCell id matches no column (TC-008)', async () => {
      await setInputs();

      @Component({
        standalone: true,
        imports: [Datagrid, DatagridCellDirective],
        template: `
          <app-datagrid [columns]="columns" [data]="data" [total]="data.length">
            <ng-template appDatagridCell="noExiste" let-row>orphan template</ng-template>
          </app-datagrid>
        `
      })
      class NonMatchingCellHost {
        public columns: DatagridColumn<Row>[] = [{ id: 'name', header: 'Nombre' }];
        public data: Row[] = [{ name: 'Ada' }];
      }

      const hostFixture = TestBed.createComponent(NonMatchingCellHost);
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const hostElement = hostFixture.nativeElement as HTMLElement;
      expect(
        hostElement.querySelector('[data-testid="datagrid-cell-name"]')?.textContent?.trim()
      ).toBe('Ada');
    });
  });

  // appDatagridHeaderCell customization and its no-op fallback
  describe('personalización de cabecera (appDatagridHeaderCell)', () => {
    it('renders the projected appDatagridHeaderCell template instead of plain text', async () => {
      await setInputs();

      @Component({
        standalone: true,
        imports: [Datagrid, DatagridHeaderCellDirective],
        template: `
          <app-datagrid [columns]="columns" [data]="data" [total]="data.length">
            <ng-template appDatagridHeaderCell="status" let-column>
              <span data-testid="custom-header">{{ column.header }} ⓘ</span>
            </ng-template>
          </app-datagrid>
        `
      })
      class MatchingHeaderCellHost {
        public columns: DatagridColumn<Row>[] = [{ id: 'status', header: 'Estado' }];
        public data: Row[] = [{ id: 1, status: 'active' }];
      }

      const hostFixture = TestBed.createComponent(MatchingHeaderCellHost);
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      hostFixture.detectChanges();
      const hostElement = hostFixture.nativeElement as HTMLElement;

      expect(hostElement.querySelector('[data-testid="custom-header"]')?.textContent?.trim()).toBe(
        'Estado ⓘ'
      );
    });

    it('does not error and renders the rest of the headers when a projected appDatagridHeaderCell id matches no column', async () => {
      await setInputs();

      @Component({
        standalone: true,
        imports: [Datagrid, DatagridHeaderCellDirective],
        template: `
          <app-datagrid [columns]="columns" [data]="data" [total]="data.length">
            <ng-template appDatagridHeaderCell="noExiste" let-column>orphan template</ng-template>
          </app-datagrid>
        `
      })
      class NonMatchingHeaderCellHost {
        public columns: DatagridColumn<Row>[] = [{ id: 'name', header: 'Nombre' }];
        public data: Row[] = [{ name: 'Ada' }];
      }

      const hostFixture = TestBed.createComponent(NonMatchingHeaderCellHost);
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const hostElement = hostFixture.nativeElement as HTMLElement;
      expect(
        hostElement.querySelector('[data-testid="datagrid-header-name"]')?.textContent?.trim()
      ).toBe('Nombre');
    });
  });

  // AC-006 — mat-paginator reflects pageIndex/pageSize/total
  describe('paginador refleja inputs (AC-006)', () => {
    it('reflects pageIndex, pageSize and total on the internal mat-paginator (TC-009)', async () => {
      await setInputs({ data: [{ id: 1 }], pageIndex: 2, pageSize: 10, total: 45 });

      const paginator = fixture.debugElement.query(By.directive(MatPaginator))
        .componentInstance as MatPaginator;

      expect(paginator.pageIndex).toBe(2);
      expect(paginator.pageSize).toBe(10);
      expect(paginator.length).toBe(45);
    });
  });

  // AC-007 — page output on page/page-size change, no HTTP call
  describe('output page (AC-007)', () => {
    it('emits page with the updated pageIndex/pageSize when the user goes to the next page (TC-010)', async () => {
      await setInputs({ data: [{ id: 1 }], pageIndex: 0, pageSize: 10, total: 30 });

      const emitted: { pageIndex: number; pageSize: number }[] = [];
      component.page.subscribe((event) => emitted.push(event));

      const paginator = await loader.getHarness(MatPaginatorHarness);
      await paginator.goToNextPage();

      // The component only emits `page`; it injects no HttpClient/repository at
      // all (see TC-019, code review), so there is nothing to spy on here.
      expect(emitted).toEqual([{ pageIndex: 1, pageSize: 10 }]);
    });

    it(
      'emits page with the updated pageSize when the user changes the page-size selector (TC-011)',
      async () => {
        await setInputs({
          data: [{ id: 1 }],
          pageIndex: 0,
          pageSize: 10,
          total: 100,
          pageSizeOptions: [10, 25, 50]
        });

        const emitted: { pageIndex: number; pageSize: number }[] = [];
        component.page.subscribe((event) => emitted.push(event));

        const paginator = await loader.getHarness(MatPaginatorHarness);
        await paginator.setPageSize(25);

        expect(emitted.at(-1)?.pageSize).toBe(25);
      },
      // `MatPaginatorHarness.setPageSize` opens and interacts with a real
      // mat-select overlay (CDK overlay animation + change detection round
      // trips); the default 5s timeout is occasionally too tight under the
      // resource contention of a full parallel run (confirmed isolated: this
      // suite's 23 tests complete in <1s standalone — see quality-check.md
      // preexisting-debt note), not a defect in this test or the component.
      15000
    );
  });

  // AC-008 — pageSizeOptions shows/hides the page-size selector
  describe('selector de tamaño de página (AC-008)', () => {
    it('shows the page-size selector with the given options when pageSizeOptions is set (TC-012)', async () => {
      await setInputs({ data: [{ id: 1 }], pageSizeOptions: [5, 10, 25] });

      const select = await loader.getHarness(
        MatSelectHarness.with({ ancestor: '.mat-mdc-paginator-page-size' })
      );
      await select.open();
      const optionTexts = await Promise.all(
        (await select.getOptions()).map((option) => option.getText())
      );

      expect(optionTexts).toEqual(['5', '10', '25']);
    });

    it('hides the page-size selector and keeps pageSize fixed when pageSizeOptions is not set (TC-013)', async () => {
      await setInputs({ data: [{ id: 1 }], pageSize: 10 });

      const paginator = fixture.debugElement.query(By.directive(MatPaginator))
        .componentInstance as MatPaginator;

      expect(paginator.hidePageSize).toBe(true);
      expect(element.querySelector('.mat-mdc-paginator-page-size-select')).toBeNull();
    });
  });

  // AC-009 — loading state
  describe('estado de carga (AC-009)', () => {
    it('shows the loading state instead of the table when loading is true (TC-014)', async () => {
      await setInputs({ data: [{ id: 1 }], loading: true });

      expect(element.querySelector('[data-testid="datagrid-loading"]')).toBeTruthy();
      expect(element.querySelector('[data-testid="datagrid-table"]')).toBeNull();
    });
  });

  // AC-010 — empty state, with emptyMessage or the default text
  describe('estado vacío (AC-010)', () => {
    it('shows the empty state with emptyMessage when it is defined (TC-015)', async () => {
      await setInputs({ data: [], emptyMessage: 'Sin catálogos' });

      const empty = element.querySelector('[data-testid="datagrid-empty"]');
      expect(empty?.textContent?.trim()).toBe('Sin catálogos');
    });

    it('shows the empty state with the default text when emptyMessage is not defined (TC-016)', async () => {
      await setInputs({ data: [] });

      const empty = element.querySelector('[data-testid="datagrid-empty"]');
      expect(empty?.textContent?.trim()).toBe('No hay registros');
    });
  });

  // AC-011 — column alignment
  describe('alineación de columna (AC-011)', () => {
    it("aligns the header and cells to the right when align is 'end' (TC-017)", async () => {
      await setInputs({
        columns: [{ id: 'actions', header: 'Acciones', align: 'end' }],
        data: [{ actions: null }]
      });

      expect(element.querySelector('[data-testid="datagrid-header-actions"]')?.classList).toContain(
        'text-end'
      );
      expect(element.querySelector('[data-testid="datagrid-cell-actions"]')?.classList).toContain(
        'text-end'
      );
    });

    it('aligns the header and cells to the left by default when align is not set (TC-018)', async () => {
      await setInputs({ columns: [{ id: 'name', header: 'Nombre' }], data: [{ name: 'Ada' }] });

      expect(element.querySelector('[data-testid="datagrid-header-name"]')?.classList).toContain(
        'text-left'
      );
      expect(element.querySelector('[data-testid="datagrid-cell-name"]')?.classList).toContain(
        'text-left'
      );
    });
  });

  // First column gets an `ms-3` spacer, both header and cell, so consumers don't
  // need to add that margin themselves.
  describe('sangría de la primera columna (ms-3)', () => {
    it('wraps the first column header and cell in a div.ms-3, but not the rest', async () => {
      await setInputs({
        columns: [
          { id: 'code', header: 'Código' },
          { id: 'name', header: 'Nombre' }
        ],
        data: [{ code: 'C1', name: 'Ada' }]
      });

      expect(
        element
          .querySelector('[data-testid="datagrid-header-code"] > div')
          ?.classList.contains('ms-3')
      ).toBe(true);
      expect(
        element
          .querySelector('[data-testid="datagrid-cell-code"] > div')
          ?.classList.contains('ms-3')
      ).toBe(true);
      expect(
        element
          .querySelector('[data-testid="datagrid-header-name"] > div')
          ?.classList.contains('ms-3')
      ).toBe(false);
      expect(
        element
          .querySelector('[data-testid="datagrid-cell-name"] > div')
          ?.classList.contains('ms-3')
      ).toBe(false);
    });

    it('wraps a custom appDatagridCell/appDatagridHeaderCell template of the first column in the ms-3 div too', async () => {
      await setInputs();

      @Component({
        standalone: true,
        imports: [Datagrid, DatagridCellDirective, DatagridHeaderCellDirective],
        template: `
          <app-datagrid [columns]="columns" [data]="data" [total]="data.length">
            <ng-template appDatagridHeaderCell="code" let-column>{{ column.header }}</ng-template>
            <ng-template appDatagridCell="code" let-row>
              <div class="ft-badge" data-testid="code-badge">{{ row.code }}</div>
            </ng-template>
          </app-datagrid>
        `
      })
      class FirstColumnTemplateHost {
        public columns: DatagridColumn<Row>[] = [{ id: 'code', header: 'Código' }];
        public data: Row[] = [{ code: 'C1' }];
      }

      const hostFixture = TestBed.createComponent(FirstColumnTemplateHost);
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      hostFixture.detectChanges();
      const hostElement = hostFixture.nativeElement as HTMLElement;

      expect(
        hostElement
          .querySelector('[data-testid="datagrid-header-code"] > div')
          ?.classList.contains('ms-3')
      ).toBe(true);
      expect(
        hostElement.querySelector('[data-testid="code-badge"]')?.parentElement?.classList
      ).toContain('ms-3');
    });
  });
});
