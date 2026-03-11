import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from 'src/generated/prisma/enums';

const normalizeOptionalString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
};

export class UpdateUserDto {
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  name?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  supervisorId?: string | null;
}
