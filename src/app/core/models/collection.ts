export interface CollectionQueryParams {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CollectionResponse<T> {
  data: T[];
  total: number;
  page: number;
  itemsPerPage: number;
}
