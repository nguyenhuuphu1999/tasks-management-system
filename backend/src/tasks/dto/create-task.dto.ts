import { IsString, IsEnum, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';
import { TASK_STATUS } from '../task-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Task example' })
  @IsString()
  @IsNotEmpty()
  public title: string;

  @ApiProperty({ example: 'Description Task example here!' })
  @IsString()
  @IsOptional()
  public description: string;

  @ApiProperty({ example: TASK_STATUS.TODO, enum: TASK_STATUS })
  @IsEnum(TASK_STATUS)
  @IsOptional()
  public status: TASK_STATUS;

  @ApiProperty({ example: new Date().toISOString() })
  @IsNotEmpty()
  @IsDateString()
  public dueDate: string;
}