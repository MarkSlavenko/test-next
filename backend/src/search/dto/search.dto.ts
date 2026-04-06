import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class GetSearchDto extends PaginationDto {
  @ApiProperty({ description: 'Search query string', example: 'React NextJS' })
  @IsString()
  @IsNotEmpty()
  q: string;
}

export class PostSearchDto extends PaginationDto {
  @ApiProperty({ description: 'Search query string to execute and save', example: 'React NextJS' })
  @IsString()
  @IsNotEmpty()
  query: string;
}