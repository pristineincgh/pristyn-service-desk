import { IsEnum } from 'class-validator';
import { UserStatus } from 'src/generated/prisma/enums';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}
