import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Priority, TicketStatus } from '../../generated/prisma/enums';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  assignedToId?: string; // optional, can assign ticket immediately
}
