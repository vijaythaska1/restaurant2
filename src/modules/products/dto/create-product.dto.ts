import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsObject, IsUrl, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  cat: string;

  @IsString()
  @IsNotEmpty()
  section: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Product name must not be empty' })
  name: string;

  @IsString()
  @IsOptional()
  desc?: string;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Price must be 0 or greater' })
  price?: number;

  @IsObject()
  @IsOptional()
  sizes?: Record<string, number>;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
