import { Directive, inject, input, TemplateRef } from '@angular/core';

/** Template context exposed to a `appDatagridCell` template: the row as `$implicit` (`let-row`). */
export interface DatagridCellContext<T> {
  $implicit: T;
}

/**
 * Marks an `<ng-template appDatagridCell="<columnId>" let-row>` projected as content of
 * `app-datagrid`, so it can render that column's cells instead of the default plain text.
 */
@Directive({
  selector: 'ng-template[appDatagridCell]'
})
export class DatagridCellDirective<T = unknown> {
  public readonly templateRef = inject<TemplateRef<DatagridCellContext<T>>>(TemplateRef);
  public readonly appDatagridCell = input.required<string>();
}
