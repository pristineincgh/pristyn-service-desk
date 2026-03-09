import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { TicketStatus } from 'src/generated/prisma/enums';

export class BulkUpdateTicketStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ticketIds!: string[];

  @IsEnum(TicketStatus)
  status!: TicketStatus;
}
