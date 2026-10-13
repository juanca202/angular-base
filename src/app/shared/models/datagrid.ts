/** Column alignment, applied to both the header and its cells. Defaults to `'start'`. */
export type DatagridColumnAlign = 'start' | 'end' | 'center';

/**
 * Configuration of a single `app-datagrid` column, generic in the row type `T`.
 * `id` doubles as the key used to match a projected `appDatagridCell` template and,
 * absent an `accessor`, as the property key read from each row for the default
 * plain-text rendering.
 */
export interface DatagridColumn<T> {
  id: string;
  header: string;
  accessor?: (row: T) => unknown;
  align?: DatagridColumnAlign;
}

/** Payload emitted by `app-datagrid`'s `page` output; mirrors Angular Material's `PageEvent`. */
export interface DatagridPageEvent {
  pageIndex: number;
  pageSize: number;
}
