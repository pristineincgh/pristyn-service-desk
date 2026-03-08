import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;
}
