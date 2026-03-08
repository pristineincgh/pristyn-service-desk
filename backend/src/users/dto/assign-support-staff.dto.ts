import { IsNotEmpty, IsString } from 'class-validator';

export class AssignSupportStaffDto {
  @IsString()
  @IsNotEmpty()
  supportStaffId!: string;

  @IsString()
  @IsNotEmpty()
  supervisorId!: string;
}
