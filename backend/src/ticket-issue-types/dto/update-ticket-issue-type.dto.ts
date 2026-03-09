import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketIssueTypeDto } from './create-ticket-issue-type.dto';

export class UpdateTicketIssueTypeDto extends PartialType(
  CreateTicketIssueTypeDto,
) {}
