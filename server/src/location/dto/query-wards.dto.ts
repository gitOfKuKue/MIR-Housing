import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class QueryWardsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  district_code: number;
}
