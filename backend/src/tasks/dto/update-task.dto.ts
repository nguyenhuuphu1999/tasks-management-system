import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TASK_STATUS } from '../task-status.enum';

export class UpdateTaskDto {
    @ApiProperty({ example: 'Task example', required: false })
    @IsString()
    @IsOptional()
    public title?: string;

    @ApiProperty({ example: 'Description Task example here!', required: false })
    @IsString()
    @IsOptional()
    public description?: string;

    @ApiProperty({ example: TASK_STATUS.TODO, enum: TASK_STATUS, required: false })
    @IsEnum(TASK_STATUS)
    @IsOptional()
    public status?: TASK_STATUS;

    @ApiProperty({ example: new Date().toISOString(), required: false })
    @IsOptional()
    @IsDateString()
    public dueDate?: string;
}  