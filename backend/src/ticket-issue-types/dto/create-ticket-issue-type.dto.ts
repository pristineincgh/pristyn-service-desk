import { IsString } from 'class-validator';

export class CreateTicketIssueTypeDto {
  @IsString()
  name!: string;
}
