export interface CollectionQueryParams<TFilters = unknown> {
  page?: number;
  pageSize?: number;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  filters?: TFilters;
}
