import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TASK_STATUS } from './task-status.enum';
import { TasksController } from './tasks.controller';
import { NotFoundException } from '@nestjs/common';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: TasksService;

  // Mock TasksService
  const mockTasksService = {
    createTask: jest.fn(),
    getTasks: jest.fn(),
    getTaskById: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  };

  // Mock user object (from @User() decorator)
  const mockUser = { id: '1', username: 'testuser', role: 'user' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService, // Provide the mock TasksService
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Mock the JwtAuthGuard
      .useValue({ canActivate: () => true }) // Always allow access
      .compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockTasksService.createTask.mockResolvedValue(mockTask);

      const result = await controller.createTask(createTaskDto, mockUser);
      expect(result).toEqual(mockTask);
      expect(mockTasksService.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
    });

    it('should throw an error if createTask fails', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TASK_STATUS.TODO,
        dueDate: '2025-04-05',
      };

      mockTasksService.createTask.mockRejectedValue(new Error('Failed to create task'));

      await expect(controller.createTask(createTaskDto, mockUser)).rejects.toThrow('Failed to create task');
      expect(mockTasksService.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
    });
  });

  // Test cases for getTasks
  describe('getTasks', () => {
    it('should get all tasks successfully with default parameters', async () => {
      const mockTasks = [{ id: '1', title: 'Task 1', status: TASK_STATUS.TODO, user: mockUser }];
      mockTasksService.getTasks.mockResolvedValue(mockTasks);

      const result = await controller.getTasks(mockUser, undefined, undefined, undefined, undefined, undefined, undefined);
      expect(result).toEqual(mockTasks);
      expect(mockTasksService.getTasks).toHaveBeenCalledWith({
        user: mockUser,
        status: undefined,
        search: undefined,
        sortDirection: undefined,
        sortBy: undefined,
        limit: undefined,
        page: undefined,
      });
    });

    it('should get tasks with specific query parameters', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: TASK_STATUS.TODO, user: mockUser },
        { id: '2', title: 'Task 2', status: TASK_STATUS.TODO, user: mockUser },
      ];
      mockTasksService.getTasks.mockResolvedValue(mockTasks);

      const result = await controller.getTasks(
        mockUser,
        TASK_STATUS.TODO,
        'Task',
        'ASC',
        'dueDate',
        10,
        1
      );
      expect(result).toEqual(mockTasks);
      expect(mockTasksService.getTasks).toHaveBeenCalledWith({
        user: mockUser,
        status: TASK_STATUS.TODO,
        search: 'Task',
        sortDirection: 'ASC',
        sortBy: 'dueDate',
        limit: 10,
        page: 1,
      });
    });

    it('should handle errors when getting tasks', async () => {
      mockTasksService.getTasks.mockRejectedValue(new Error('Failed to get tasks'));

      await expect(controller.getTasks(mockUser, undefined, undefined, undefined, undefined, undefined, undefined))
        .rejects.toThrow('Failed to get tasks');
      expect(mockTasksService.getTasks).toHaveBeenCalledWith({
        user: mockUser,
        status: undefined,
        search: undefined,
        sortDirection: undefined,
        sortBy: undefined,
        limit: undefined,
        page: undefined,
      });
    });
  });

  // Test cases for getTaskById
  describe('getTaskById', () => {
    it('should get a task by ID successfully', async () => {
      const taskId = '1';
      const mockTask = { id: taskId, title: 'Task 1', status: TASK_STATUS.TODO, user: mockUser };
      mockTasksService.getTaskById.mockResolvedValue(mockTask);

      const result = await controller.getTaskById(taskId, mockUser);
      expect(result).toEqual(mockTask);
      expect(mockTasksService.getTaskById).toHaveBeenCalledWith(taskId, mockUser);
    });

    it('should throw NotFoundException if task is not found', async () => {
      const taskId = '1';
      mockTasksService.getTaskById.mockRejectedValue(new NotFoundException('Task not found'));

      await expect(controller.getTaskById(taskId, mockUser)).rejects.toThrow(NotFoundException);
      expect(mockTasksService.getTaskById).toHaveBeenCalledWith(taskId, mockUser);
    });
  });

  // Test cases for updateTask
  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const taskId = '1';
      const updateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: TASK_STATUS.INPROGRESS,
        dueDate: '2025-04-06',
      };
      const updatedTask = { id: taskId, ...updateTaskDto, user: mockUser };
      mockTasksService.updateTask.mockResolvedValue(updatedTask);

      const result = await controller.updateTask(taskId, updateTaskDto, mockUser);
      expect(result).toEqual(updatedTask);
      expect(mockTasksService.updateTask).toHaveBeenCalledWith(taskId, updateTaskDto, mockUser);
    });

    it('should throw NotFoundException if task to update is not found', async () => {
      const taskId = '1';
      const updateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: TASK_STATUS.INPROGRESS,
        dueDate: '2025-04-06',
      };
      mockTasksService.updateTask.mockRejectedValue(new NotFoundException('Task not found'));

      await expect(controller.updateTask(taskId, updateTaskDto, mockUser)).rejects.toThrow(NotFoundException);
      expect(mockTasksService.updateTask).toHaveBeenCalledWith(taskId, updateTaskDto, mockUser);
    });
  });

  // Test cases for deleteTask
  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const taskId = '1';
      mockTasksService.deleteTask.mockResolvedValue(undefined); // Giả lập xóa thành công

      const result = await controller.deleteTask(taskId, mockUser);
      expect(result).toBeUndefined();
      expect(mockTasksService.deleteTask).toHaveBeenCalledWith(taskId, mockUser);
    });

    it('should throw NotFoundException if task to delete is not found', async () => {
      const taskId = '1';
      mockTasksService.deleteTask.mockRejectedValue(new NotFoundException('Task not found'));

      await expect(controller.deleteTask(taskId, mockUser)).rejects.toThrow(NotFoundException);
      expect(mockTasksService.deleteTask).toHaveBeenCalledWith(taskId, mockUser);
    });
  });
});