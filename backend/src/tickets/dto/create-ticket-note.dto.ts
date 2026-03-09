import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTicketNoteDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
