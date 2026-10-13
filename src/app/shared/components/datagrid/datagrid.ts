import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  output
} from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

import type {
  DatagridColumn,
  DatagridColumnAlign,
  DatagridPageEvent
} from '@/shared/models/datagrid';
import { DatagridCellDirective } from './datagrid-cell.directive';
import { DatagridHeaderCellDirective } from './datagrid-header-cell.directive';

/** Page size used when the consumer does not provide one. */
const DEFAULT_PAGE_SIZE = 10;

/** Text shown by the empty state when the consumer does not provide `emptyMessage`. */
const DEFAULT_EMPTY_MESSAGE = 'No hay registros';

/**
 * Reusable, paginated table. Wraps `mat-table` and `mat-paginator` (ADR-004): the
 * consumer configures `columns` and passes the current page's `data`/`total`
 * (server-side pagination, ADR-006) — the component only displays what it
 * receives and emits `page` on navigation; it never fetches data itself.
 * A column's cell can be customized by projecting
 * `<ng-template appDatagridCell="<columnId>" let-row>`; columns without a matching
 * projected template fall back to plain text via their `accessor` (or `row[id]`).
 * A column's header cell can likewise be customized by projecting
 * `<ng-template appDatagridHeaderCell="<columnId>" let-column>`; columns without a
 * matching projected template fall back to plain text via `column.header`.
 * The first column's header and cell content (custom or default) are wrapped in a
 * `ms-3` div, so consumers don't need to add that spacing themselves.
 */
@Component({
  selector: 'app-datagrid',
  imports: [MatPaginatorModule, MatTableModule, NgTemplateOutlet],
  templateUrl: './datagrid.html',
  styleUrl: './datagrid.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Datagrid<T> {
  public readonly columns = input.required<DatagridColumn<T>[]>();
  public readonly data = input.required<readonly T[]>();
  public readonly total = input.required<number>();
  public readonly pageIndex = input<number>(0);
  public readonly pageSize = input<number>(DEFAULT_PAGE_SIZE);
  public readonly pageSizeOptions = input<number[]>();
  public readonly trackBy = input<(row: T) => unknown>();
  public readonly loading = input(false);
  public readonly emptyMessage = input<string>();

  public readonly page = output<DatagridPageEvent>();

  protected readonly cellTemplates = contentChildren(DatagridCellDirective);
  protected readonly headerCellTemplates = contentChildren(DatagridHeaderCellDirective);

  protected readonly columnIds = computed<string[]>(() =>
    this.columns().map((column) => column.id)
  );

  protected readonly emptyMessageText = computed<string>(
    () => this.emptyMessage() ?? DEFAULT_EMPTY_MESSAGE
  );

  protected alignClass(align: DatagridColumnAlign | undefined): string {
    switch (align) {
      case 'end':
        return 'text-end';
      case 'center':
        return 'text-center';
      default:
        return 'text-left';
    }
  }

  protected cellTemplateFor(columnId: string): DatagridCellDirective<T> | undefined {
    return this.cellTemplates().find((template) => template.appDatagridCell() === columnId);
  }

  protected headerCellTemplateFor(columnId: string): DatagridHeaderCellDirective<T> | undefined {
    return this.headerCellTemplates().find(
      (template) => template.appDatagridHeaderCell() === columnId
    );
  }

  protected cellValue(column: DatagridColumn<T>, row: T): unknown {
    return column.accessor ? column.accessor(row) : (row as Record<string, unknown>)[column.id];
  }

  protected onPage(event: PageEvent): void {
    this.page.emit({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }

  protected readonly trackRow = (index: number, row: T): unknown => {
    const trackBy = this.trackBy();
    return trackBy ? trackBy(row) : index;
  };
}
