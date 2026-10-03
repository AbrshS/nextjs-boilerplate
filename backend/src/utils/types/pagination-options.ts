export interface IPaginationOptions {
  page: number;
  limit: number;
}

export interface InfinityPaginationResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
