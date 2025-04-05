import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { Task } from './task.entity';
import { User } from '../users/user.entity';
import { TASK_STATUS } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ROLE } from '../users/role.enum';
import { LoggerService } from 'src/common/logger/logger.service';
import { TasksRepository } from './tasks.repository';
import { ResponsePaging } from 'src/common/repository/response';

@Injectable()
export class TasksService {
  public constructor(
    private tasksRepository: TasksRepository,
    private readonly logger: LoggerService,
  ) { }

  public async createTask(createTaskDto: CreateTaskDto, user: User): Promise<void> {
    this.logger.log({}, 'Creating task...');

    const task = await this.tasksRepository.insert(undefined, { ...createTaskDto, user });
    this.logger.log({}, `Task ${task.id} created successfully`);
  }

  public async getTasks(
      input: {
        user: User,
        status?: TASK_STATUS,
        search?: string,
        sortDirection?: 'ASC' | 'DESC',
        page?: number, 
        limit?: number, 
        sortBy?: string
      }
  ): Promise<ResponsePaging<Task>> { 

    try {
      this.logger.log({}, 'Fetching tasks...');

      // Build filter
      const filter: any = {};
      if (input.user.role !== ROLE.ADMIN) {
        filter.userId = input.user.id;
      }
      if (input.status) {
        filter.status = input.status;
      }
      if (input.search) {
        filter.title = { $ilike: `%${input.search}%` }; 
      }

      // Build order
      let order: FindOptionsOrder<Task> =  {}
      if (input.sortDirection && input.sortBy) {
        order = { [input.sortBy]: input.sortDirection.toUpperCase() };
      }

      // Call findWithPagination from BasePostgresRepository
      const result = await this.tasksRepository.getPaging(undefined, filter, input.page, input.limit, order);

      return result;
    } catch (error) {
      this.logger.error({}, 'Error fetching tasks', error);
      throw new InternalServerErrorException('Error fetching tasks');
    }
  }

  public async getTaskById(id: string, user: User): Promise<Task> {
    this.logger.log({correlationId: id}, `Fetching task with ID: ${id}`);
    const task = await this.tasksRepository.findOne(undefined, { 
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        dueDate: true,
        user: {
          id: true,
          username: true,
          email: true,
          role: true,
        }, 
      },
      where: { id }, 
      relations: ['user'] 
  });

    if (!task) {
      this.logger.error({correlationId: id}, 'Task not found');
      throw new BadRequestException('Task not found');
    }

    if (user.role !== ROLE.ADMIN && task.user.id !== user.id) {
      this.logger.error({correlationId: id}, 'Forbidden access to task');
      throw new ForbiddenException('You can only access your own tasks');
    }

    this.logger.log({correlationId: id}, `Task with ID: ${id} fetched successfully`);
    return task;
  }

  public async updateTask(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<void> {
    this.logger.log({correlationId: id}, `Updating task with ID: ${id}`);

    const task = await this.getTaskById(id, user);
    Object.assign(task, updateTaskDto);

    await this.tasksRepository.update(undefined, { where: { id } }, task);
    this.logger.log({correlationId: id}, `Task with ID: ${id} updated successfully`);
  }

  public async deleteTask(id: string, user: User): Promise<void> {
    this.logger.log({correlationId: id}, `Deleting task with ID: ${id}`);
    const task = await this.getTaskById(id, user);
    await this.tasksRepository.update(undefined, { where: { id } }, { deleted: true });
    this.logger.log({correlationId: id}, `Task with ID: ${id} deleted successfully`);
  }
}