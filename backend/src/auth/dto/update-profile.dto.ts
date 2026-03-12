import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

const normalizeOptionalString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
};

export class UpdateProfileDto {
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
}
