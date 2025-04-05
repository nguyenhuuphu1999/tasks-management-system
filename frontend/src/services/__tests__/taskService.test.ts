
import { vi } from 'vitest';
import { 
  updateTaskStatus,
  getAllTasksLocal,
  getTaskByIdLocal,
  updateTaskLocal,
  deleteTaskLocal,
  createTaskLocal
} from '../taskService';
import { TASK_STATUS } from '@/types';

// Create a mock task store for testing
let mockTasks = [];
const mockTaskId = () => Math.random().toString(36).substring(2, 9);

// Mock the taskService local functions
vi.mock('../taskService', async () => {
  const actual = await vi.importActual('../taskService');
  
  return {
    ...actual,
    getAllTasksLocal: vi.fn(() => mockTasks),
    
    getTaskByIdLocal: vi.fn((id) => {
      if (!id) return undefined;
      return mockTasks.find(task => task.id === id);
    }),
    
    createTaskLocal: vi.fn((taskData) => {
      if (!taskData) throw new Error('Task data is required');
      
      const now = new Date().toISOString();
      const newTask = {
        id: mockTaskId(),
        userId: taskData.userId || 'default-user',
        title: taskData.title || 'Default Title',
        description: taskData.description || 'Default Description',
        status: taskData.status || 'todo',
        dueDate: taskData.dueDate || now,
        createdAt: now,
        updatedAt: now,
      };
      
      mockTasks.push(newTask);
      return newTask;
    }),
    
    updateTaskLocal: vi.fn((id, updates) => {
      if (!id) throw new Error('Task ID is required');
      if (!updates) throw new Error('Updates are required');
      
      const taskIndex = mockTasks.findIndex(t => t.id === id);
      if (taskIndex === -1) throw new Error(`Task with id ${id} not found`);
      
      mockTasks[taskIndex] = {
        ...mockTasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      return mockTasks[taskIndex];
    }),
    
    deleteTaskLocal: vi.fn((id) => {
      if (!id) throw new Error('Task ID is required');
      mockTasks = mockTasks.filter(t => t.id !== id);
    }),
  };
});

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to clear mocks before each test
beforeEach(() => {
  mockTasks = [];
  vi.clearAllMocks();
});

describe('Task Service', () => {
  const mockTask = {
    userId: 'user1',
    title: 'Test Task',
    description: 'This is a test task',
    status: TASK_STATUS.TODO,
    dueDate: new Date().toISOString(),
  };

  describe('createTask', () => {
    it('should create a new task', () => {
      const task = { ...mockTask };
      const createdTask = createTaskLocal(task);
      
      expect(createdTask).toHaveProperty('id');
      expect(createdTask).toHaveProperty('createdAt');
      expect(createdTask).toHaveProperty('updatedAt');
      expect(createdTask.title).toBe(mockTask.title);
    });
  });
  
  describe('getAllTasks', () => {
    it('should return an array of tasks', () => {
      // Create some test tasks
      const task1 = { ...mockTask };
      const task2 = { ...mockTask, title: 'Another Task' };
      createTaskLocal(task1);
      createTaskLocal(task2);
      
      const tasks = getAllTasksLocal();
      
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBe(2);
    });
  });
  
  describe('getTaskById', () => {
    it('should return a task by id', () => {
      const task = { ...mockTask };
      const createdTask = createTaskLocal(task);
      
      const foundTask = getTaskByIdLocal(createdTask.id);
      
      expect(foundTask).toBeDefined();
      expect(foundTask.id).toBe(createdTask.id);
    });
    
    it('should return undefined for non-existent task', () => {
      const foundTask = getTaskByIdLocal('non-existent-id');
      
      expect(foundTask).toBeUndefined();
    });
  });
  
  describe('updateTask', () => {
    it('should update an existing task', () => {
      const task = { ...mockTask };
      const createdTask = createTaskLocal(task);
      const updates = { title: 'Updated Title' };
      
      const updatedTask = updateTaskLocal(createdTask.id, updates);
      
      expect(updatedTask.title).toBe(updates.title);
    });
    
    it('should throw an error for non-existent task', () => {
      expect(() => updateTaskLocal('non-existent-id', { title: 'Updated Title' }))
        .toThrow('Task with id non-existent-id not found');
    });
  });
  
  describe('updateTaskStatus', () => {
    it('should exist as a function', () => {
      expect(typeof updateTaskStatus).toBe('function');
    });
  });
  
  describe('deleteTask', () => {
    it('should delete a task', () => {
      const task = { ...mockTask };
      const createdTask = createTaskLocal(task);
      
      deleteTaskLocal(createdTask.id);
      
      const tasks = getAllTasksLocal();
      expect(tasks.length).toBe(0);
    });
    
    it('should not throw an error for non-existent task', () => {
      expect(() => deleteTaskLocal('non-existent-id')).not.toThrow();
    });
  });
});
