import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TASK_STATUS } from './task-status.enum';
import { User } from '../users/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('tasks')
@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}
  
  @Post()
  public async createTask(@Body() createTaskDto: CreateTaskDto, @User() user) {
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Get()
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: TASK_STATUS, 
    description: 'Filter tasks by status' 
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    type: String, 
    description: 'Search tasks by title (case-insensitive)' 
  })
  @ApiQuery({ 
    name: 'sortDirection', 
    required: false, 
    enum: ['ASC', 'DESC'], 
    description: 'Sort tasks',
    example: 'ASC'
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    description: 'Sort tasks by field',
    example: 'dueDate'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of tasks per page', 
    example: 10 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number', 
    example: 1 
  })
  public async getTasks(
    @User() user,
    @Query('status') status?: TASK_STATUS,
    @Query('search') search?: string,
    @Query('sortDirection') sortDirection?: 'ASC' | 'DESC',
    @Query('sortBy') sortBy?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.tasksService.getTasks({
      user,
      status,
      limit,
      page,
      search,
      sortDirection,
      sortBy
    });
  }

  @Get(':id')
  public async getTaskById(@Param('id') id: string, @User() user) {
    return this.tasksService.getTaskById(id, user);
  }

  @Put(':id')
  public async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @User() user) {
    return this.tasksService.updateTask(id, updateTaskDto, user);
  }

  @Delete(':id')
  public async deleteTask(@Param('id') id: string, @User() user) {
    return this.tasksService.deleteTask(id, user);
  }
}