import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { LoggerService } from 'src/common/logger/logger.service';
import { TASK_STATUS } from './task-status.enum';
import { ROLE } from '../users/role.enum';
import { User } from '../users/user.entity';
import { Task } from './task.entity';
import { BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { ResponsePaging } from 'src/common/repository/response';

describe('TasksService', () => {
  let service: TasksService;
  let tasksRepository: TasksRepository;
  let loggerService: LoggerService;

  // Mock TasksRepository
  const mockTasksRepository = {
    insert: jest.fn(),
    getPaging: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  // Mock LoggerService
  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
  };

  // Mock user object
  const mockUser: User = {
    id: '1',
    username: 'test',
    email: 'test@example.com',
    role: ROLE.USER,
    password: 'password',
    tasks: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    deleted: false,
  };

  // Mock admin user
  const mockAdminUser: User = {
    id: '2',
    username: 'admin',
    email: 'admin@example.com',
    role: ROLE.ADMIN,
    password: 'adminpassword',
    tasks: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    deleted: false,
  };

  // Mock a different user (not the owner)
  const mockDifferentUser: User = {
    id: '3',
    username: 'different',
    email: 'different@example.com',
    role: ROLE.USER,
    password: 'differentpassword',
    tasks: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    deleted: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TasksRepository,
          useValue: mockTasksRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    tasksRepository = module.get<TasksRepository>(TasksRepository);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test cases for createTask
  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TASK_STATUS.TODO,
        dueDate: '2025-04-05',
      };
      const mockTask = { id: '1', ...createTaskDto, user: mockUser };

      mockTasksRepository.insert.mockResolvedValue(mockTask);

      await service.createTask(createTaskDto, mockUser);

      expect(mockLoggerService.log).toHaveBeenCalledWith({}, 'Creating task...');
      expect(mockTasksRepository.insert).toHaveBeenCalledWith(undefined, { ...createTaskDto, user: mockUser });
      expect(mockLoggerService.log).toHaveBeenCalledWith({}, `Task ${mockTask.id} created successfully`);
    });

    it('should throw an error if task creation fails', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TASK_STATUS.TODO,
        dueDate: '2025-04-05',
      };

      mockTasksRepository.insert.mockRejectedValue(new Error('Failed to create task'));

      await expect(service.createTask(createTaskDto, mockUser)).rejects.toThrow('Failed to create task');
      expect(mockLoggerService.log).toHaveBeenCalledWith({}, 'Creating task...');
      expect(mockTasksRepository.insert).toHaveBeenCalledWith(undefined, { ...createTaskDto, user: mockUser });
    });
  });

  // Test cases for getTasks
  describe('getTasks', () => {
    it('should get tasks successfully for a regular user', async () => {
      const mockTasks: Task[] = [
        { id: '1', title: 'Task 1', description: 'Desc 1', status: TASK_STATUS.TODO, dueDate: new Date('2025-04-05'), user: mockUser, userId: mockUser.id },
      ];
      const mockResponse: ResponsePaging<Task> = {
        dataPaging: mockTasks,
        totalData: 1,
        totalPage: 1,
        currentPage: 1,
        perPage: 10,
      };

      mockTasksRepository.getPaging.mockResolvedValue(mockResponse);

      const result = await service.getTasks({
        user: mockUser,
        status: TASK_STATUS.TODO,
        search: 'Task',
        sortDirection: 'ASC',
        sortBy: 'dueDate',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(mockLoggerService.log).toHaveBeenCalledWith({}, 'Fetching tasks...');
      expect(mockTasksRepository.getPaging).toHaveBeenCalledWith(
        undefined,
        { userId: mockUser.id, status: TASK_STATUS.TODO, title: { $ilike: '%Task%' } },
        1,
        10,
        { dueDate: 'ASC' }
      );
    });

    it('should get tasks successfully for an admin user (no userId filter)', async () => {
      const mockTasks: Task[] = [
        { id: '1', title: 'Task 1', description: 'Desc 1', status: TASK_STATUS.TODO, dueDate: new Date('2025-04-05'), user: mockUser, userId: mockUser.id },
      ];
      const mockResponse: ResponsePaging<Task> = {
        dataPaging: mockTasks,
        totalData: 1,
        totalPage: 1,
        currentPage: 1,
        perPage: 10,
      };

      mockTasksRepository.getPaging.mockResolvedValue(mockResponse);

      const result = await service.getTasks({
        user: mockAdminUser,
        status: TASK_STATUS.TODO,
        search: 'Task',
        sortDirection: 'ASC',
        sortBy: 'dueDate',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(mockLoggerService.log).toHaveBeenCalledWith({}, 'Fetching tasks...');
      expect(mockTasksRepository.getPaging).toHaveBeenCalledWith(
        undefined,
        { status: TASK_STATUS.TODO, title: { $ilike: '%Task%' } },
        1,
        10,
        { dueDate: 'ASC' }
      );
    });

    it('should throw InternalServerErrorException if fetching tasks fails', async () => {
      mockTasksRepository.getPaging.mockRejectedValue(new Error('Database error'));

      await expect(
        service.getTasks({
          user: mockUser,
          status: TASK_STATUS.TODO,
          search: 'Task',
          sortDirection: 'ASC',
          sortBy: 'dueDate',
          page: 1,
          limit: 10,
        })
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockLoggerService.log).toHaveBeenCalledWith({}, 'Fetching tasks...');
      expect(mockLoggerService.error).toHaveBeenCalledWith({}, 'Error fetching tasks', expect.any(Error));
    });
  });

  // Test cases for getTaskById
  describe('getTaskById', () => {
    it('should get a task by ID successfully for the owner', async () => {
      const taskId = '1';
      const mockTask: Task = {
        id: taskId,
        title: 'Task 1',
        description: 'Desc 1',
        status: TASK_STATUS.TODO,
        dueDate: new Date('2025-04-05'),
        user: mockUser,
        userId: mockUser.id,
      };

      mockTasksRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.getTaskById(taskId, mockUser);

      expect(result).toEqual(mockTask);
      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Fetching task with ID: ${taskId}`);
      expect(mockTasksRepository.findOne).toHaveBeenCalledWith(undefined, {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          dueDate: true,
          user: { id: true, username: true, email: true, role: true },
        },
        where: { id: taskId },
        relations: ['user'],
      });
      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Task with ID: ${taskId} fetched successfully`);
    });

    it('should get a task by ID successfully for an admin', async () => {
      const taskId = '1';
      const mockTask: Task = {
        id: taskId,
        title: 'Task 1',
        description: 'Desc 1',
        status: TASK_STATUS.TODO,
        dueDate: new Date('2025-04-05'),
        user: mockUser,
        userId: mockUser.id,
      };

      mockTasksRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.getTaskById(taskId, mockAdminUser);

      expect(result).toEqual(mockTask);
      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Fetching task with ID: ${taskId}`);
      expect(mockTasksRepository.findOne).toHaveBeenCalledWith(undefined, {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          dueDate: true,
          user: { id: true, username: true, email: true, role: true },
        },
        where: { id: taskId },
        relations: ['user'],
      });
      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Task with ID: ${taskId} fetched successfully`);
    });

    it('should throw BadRequestException if task is not found', async () => {
      const taskId = '1';
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.getTaskById(taskId, mockUser)).rejects.toThrow(BadRequestException);
      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Fetching task with ID: ${taskId}`);
      expect(mockLoggerService.error).toHaveBeenCalledWith({ correlationId: taskId }, 'Task not found');
    });

    it('should throw ForbiddenException if user is not the owner and not an admin', async () => {
      const taskId = '1';
      const mockTask: Task = {
        id: taskId,
        title: 'Task 1',
        description: 'Desc 1',
        status: TASK_STATUS.TODO,
        dueDate: new Date('2025-04-05'),
        user: mockDifferentUser,
        userId: mockDifferentUser.id,
      };

      mockTasksRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.getTaskById(taskId, mockUser)).rejects.toThrow(ForbiddenException);
      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Fetching task with ID: ${taskId}`);
      expect(mockLoggerService.error).toHaveBeenCalledWith({ correlationId: taskId }, 'Forbidden access to task');
    });
  });

  // Test cases for updateTask
  describe('updateTask', () => {
    it('should update a task successfully for the owner', async () => {
      const taskId = '1';
      const updateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: TASK_STATUS.INPROGRESS, // Fixed to INPROGRESS
        dueDate: '2025-04-06',
      };
      const mockTask: Task = {
        id: taskId,
        title: 'Task 1',
        description: 'Desc 1',
        status: TASK_STATUS.TODO,
        dueDate: new Date('2025-04-05'),
        user: mockUser,
        userId: mockUser.id,
      };

      mockTasksRepository.findOne.mockResolvedValue(mockTask);
      mockTasksRepository.update.mockResolvedValue(undefined);

      await service.updateTask(taskId, updateTaskDto, mockUser);

      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Updating task with ID: ${taskId}`);
      expect(mockTasksRepository.update).toHaveBeenCalledWith(
        undefined,
        { where: { id: taskId } },
        expect.objectContaining({ ...updateTaskDto })
      );
      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Task with ID: ${taskId} updated successfully`);
    });

    it('should throw BadRequestException if task is not found', async () => {
      const taskId = '1';
      const updateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: TASK_STATUS.INPROGRESS,
        dueDate: '2025-04-06',
      };

      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.updateTask(taskId, updateTaskDto, mockUser)).rejects.toThrow(BadRequestException);
      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Updating task with ID: ${taskId}`);
    });

    it('should throw ForbiddenException if user is not the owner and not an admin', async () => {
      const taskId = '1';
      const updateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: TASK_STATUS.INPROGRESS,
        dueDate: '2025-04-06',
      };
      const mockTask: Task = {
        id: taskId,
        title: 'Task 1',
        description: 'Desc 1',
        status: TASK_STATUS.TODO,
        dueDate: new Date('2025-04-05'),
        user: mockDifferentUser,
        userId: mockDifferentUser.id,
      };

      mockTasksRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.updateTask(taskId, updateTaskDto, mockUser)).rejects.toThrow(ForbiddenException);
      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Updating task with ID: ${taskId}`);
    });
  });

  // Test cases for deleteTask
  describe('deleteTask', () => {
    it('should delete a task successfully for the owner', async () => {
      const taskId = '1';
      const mockTask: Task = {
        id: taskId,
        title: 'Task 1',
        description: 'Desc 1',
        status: TASK_STATUS.TODO,
        dueDate: new Date('2025-04-05'),
        user: mockUser,
        userId: mockUser.id,
      };

      mockTasksRepository.findOne.mockResolvedValue(mockTask);
      mockTasksRepository.update.mockResolvedValue(undefined);

      await service.deleteTask(taskId, mockUser);

      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Deleting task with ID: ${taskId}`);
      expect(mockTasksRepository.update).toHaveBeenCalledWith(
        undefined,
        { where: { id: taskId } },
        { deleted: true }
      );
      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Task with ID: ${taskId} deleted successfully`);
    });

    it('should throw BadRequestException if task is not found', async () => {
      const taskId = '1';

      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteTask(taskId, mockUser)).rejects.toThrow(BadRequestException);
      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Deleting task with ID: ${taskId}`);
    });

    it('should throw ForbiddenException if user is not the owner and not an admin', async () => {
      const taskId = '1';
      const mockTask: Task = {
        id: taskId,
        title: 'Task 1',
        description: 'Desc 1',
        status: TASK_STATUS.TODO,
        dueDate: new Date('2025-04-05'),
        user: mockDifferentUser,
        userId: mockDifferentUser.id,
      };

      mockTasksRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.deleteTask(taskId, mockUser)).rejects.toThrow(ForbiddenException);
      expect(mockLoggerService.log).toHaveBeenCalledWith({ correlationId: taskId }, `Deleting task with ID: ${taskId}`);
    });
  });
});