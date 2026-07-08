import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export function resolvePagination(page?: number, limit?: number) {
  const resolvedPage = page ?? DEFAULT_PAGE;
  const resolvedLimit = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const from = (resolvedPage - 1) * resolvedLimit;
  const to = from + resolvedLimit - 1;

  return {
    page: resolvedPage,
    limit: resolvedLimit,
    from,
    to,
  };
}
