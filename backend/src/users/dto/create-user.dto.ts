import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRole } from 'src/generated/prisma/enums';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
