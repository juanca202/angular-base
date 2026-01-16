export interface CollectionQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CollectionResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}
