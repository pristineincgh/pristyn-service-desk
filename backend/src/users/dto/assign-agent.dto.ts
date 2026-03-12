import { IsNotEmpty, IsString } from 'class-validator';

export class AssignAgentDto {
  @IsString()
  @IsNotEmpty()
  supervisorId!: string;
}
