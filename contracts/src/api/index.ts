export interface ApiResponse<TData> {
  data: TData;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
