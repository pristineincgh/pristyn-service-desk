import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Priority, TicketStatus } from 'src/generated/prisma/enums';

const normalizeOptionalQueryString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
};

export class FindAllTicketsQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @Transform(normalizeOptionalQueryString)
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Transform(normalizeOptionalQueryString)
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @Transform(normalizeOptionalQueryString)
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @Transform(normalizeOptionalQueryString)
  @IsOptional()
  @IsString()
  search?: string;
}
