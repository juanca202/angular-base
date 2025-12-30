export interface HttpApiResponse<T> {
  success: boolean;
  data: T;
  meta?: ApiMeta;
  error?: ApiError | null;
}

export interface ApiMeta {
  pagination?: PaginationMeta;
  timestamp?: string;
  requestId?: string;
}

export interface PaginationMeta {
  offset: number;
  limit: number;
  total: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
