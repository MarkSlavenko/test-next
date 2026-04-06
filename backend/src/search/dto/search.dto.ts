import { IsString, IsNotEmpty } from 'class-validator';

export class GetSearchDto {
  @IsString()
  @IsNotEmpty()
  q: string;
}

export class PostSearchDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}