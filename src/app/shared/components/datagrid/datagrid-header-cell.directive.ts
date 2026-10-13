import { Directive, inject, input, TemplateRef } from '@angular/core';

import type { DatagridColumn } from '@/shared/models/datagrid';

/** Template context exposed to a `appDatagridHeaderCell` template: the column as `$implicit` (`let-column`). */
export interface DatagridHeaderCellContext<T> {
  $implicit: DatagridColumn<T>;
}

/**
 * Marks an `<ng-template appDatagridHeaderCell="<columnId>" let-column>` projected as content of
 * `app-datagrid`, so it can render that column's header cell instead of the default `column.header` text.
 */
@Directive({
  selector: 'ng-template[appDatagridHeaderCell]'
})
export class DatagridHeaderCellDirective<T = unknown> {
  public readonly templateRef = inject<TemplateRef<DatagridHeaderCellContext<T>>>(TemplateRef);
  public readonly appDatagridHeaderCell = input.required<string>();
}
