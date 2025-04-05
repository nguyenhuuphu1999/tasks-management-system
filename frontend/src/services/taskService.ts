
import { Task, TaskFilter, TASK_STATUS } from '@/types';
import {
  loginUser as loginUserAPI,
  registerUser as registerUserAPI,
  fetchTasksFromAPI,
  fetchTaskByIdFromAPI,
  createTaskInAPI,
  updateTaskInAPI,
  deleteTaskFromAPI
} from '@/api';
import { toast } from 'sonner';

// Local task storage for testing purposes
let localTasks: Task[] = [];

// Export the API functions with proper error handling
export const loginUser = async (email: string, password: string): Promise<{ user: any, token: string }> => {
  try {
    return await loginUserAPI(email, password);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to login';
    toast.error(errorMessage);
    throw error;
  }
};

export const registerUser = async (username: string, email: string, password: string): Promise<{ user: any, token: string }> => {
  try {
    return await registerUserAPI(username, email, password);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to register';
    toast.error(errorMessage);
    throw error;
  }
};

// Get all tasks for the current user
export const getUserTasks = async (userId: string, isAdmin: boolean, filter?: TaskFilter): Promise<{
  tasks: {
    dataPaging: Task[];
    perPage: number;
    totalPage: number;
    totalData: number;
    currentPage: number;
  }, total: number
}> => {
  try {
    console.log('Fetching tasks with filter in service:', filter);
    const response = await fetchTasksFromAPI(filter?.page || 1, filter?.limit || 10, filter);
    console.log('API Response in service:', response);
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
    toast.error(errorMessage);
    throw error;
  }
};

// Get a single task by ID
export const getTaskById = async (taskId: string): Promise<Task> => {
  try {
    const task = await fetchTaskByIdFromAPI(taskId);
    return task;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Failed to fetch task ${taskId}`;
    toast.error(errorMessage);
    throw error;
  }
};

// Create a new task
export const createTask = async (task: {
  userId: string;
  title: string;
  description: string;
  status: TASK_STATUS;
  dueDate: string;
}): Promise<Task> => {
  try {
    return await createTaskInAPI({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
    toast.error(errorMessage);
    throw error;
  }
};

// Update an existing task
export const updateTask = async (
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Task> => {
  try {
    return await updateTaskInAPI(taskId, updates);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Failed to update task ${taskId}`;
    toast.error(errorMessage);
    throw error;
  }
};

// Update task status
export const updateTaskStatus = async (taskId: string, status: TASK_STATUS): Promise<Task> => {
  return updateTask(taskId, { status });
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await deleteTaskFromAPI(taskId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Failed to delete task ${taskId}`;
    toast.error(errorMessage);
    throw error;
  }
};

// Test helper functions with implementations for testing
export const getAllTasksLocal = (): Task[] => {
  return localTasks;
};

export const getTaskByIdLocal = (id: string): Task | undefined => {
  if (!id) return undefined;
  return localTasks.find(task => task.id === id);
};

export const createTaskLocal = (taskData: {
  userId: string;
  title: string;
  description: string;
  status: TASK_STATUS;
  dueDate: string;
}): Task => {
  if (!taskData) throw new Error('Task data is required');
  
  const now = new Date().toISOString();
  const newTask: Task = {
    id: Math.random().toString(36).substring(2, 9),
    userId: taskData.userId || 'default-user',
    title: taskData.title || 'Default Title',
    description: taskData.description || 'Default Description',
    status: taskData.status || TASK_STATUS.TODO,
    dueDate: taskData.dueDate || now,
    createdAt: now,
    updatedAt: now,
  };
  
  localTasks.push(newTask);
  return newTask;
};

export const updateTaskLocal = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Task => {
  if (!id) throw new Error('Task ID is required');
  if (!updates) throw new Error('Updates are required');
  
  const taskIndex = localTasks.findIndex(t => t.id === id);
  if (taskIndex === -1) throw new Error(`Task with id ${id} not found`);
  
  localTasks[taskIndex] = {
    ...localTasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return localTasks[taskIndex];
};

export const deleteTaskLocal = (id: string): void => {
  if (!id) throw new Error('Task ID is required');
  localTasks = localTasks.filter(t => t.id !== id);
};

export const getUserTasksLocal = async (): Promise<{ tasks: Task[], total: number }> => {
  return { tasks: localTasks, total: localTasks.length };
};
