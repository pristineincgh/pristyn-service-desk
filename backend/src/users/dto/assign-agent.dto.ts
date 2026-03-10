import { IsNotEmpty, IsString } from 'class-validator';

export class AssignAgentDto {
  @IsString()
  @IsNotEmpty()
  agentId!: string;

  @IsString()
  @IsNotEmpty()
  supervisorId!: string;
}
