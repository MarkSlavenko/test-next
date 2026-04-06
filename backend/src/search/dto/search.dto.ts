import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class GetSearchDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  q: string;
}

export class PostSearchDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}