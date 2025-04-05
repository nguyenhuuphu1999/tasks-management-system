
import apiClient from './apiClient';
import { Task, TaskFilter, TASK_STATUS } from '@/types';

export const fetchTasksFromAPI = async (
  page = 1,
  limit = 10,
  filter?: TaskFilter
): Promise<{
  tasks: {
    dataPaging: Task[];
    perPage: number;
    totalPage: number;
    totalData: number;
    currentPage: number;
  };
  total: number;
}> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filter?.status) {
      params.append('status', filter.status.toUpperCase());
    }
    if (filter?.searchQuery) {
      params.append('search', filter.searchQuery);
    }
    
    // Fix the sort parameters
    if (filter?.sortBy === 'dueDate') {
      params.append('sortBy', 'dueDate');
      params.append('sortDirection', filter.sortDirection || 'ASC');
    }

    const response = await apiClient.get('/tasks', { params });
    
    // Check data structure and create proper response
    const responseData = response.data;
    // The API returns data directly with dataPaging inside
    return {
      tasks: {
        dataPaging: responseData.data.dataPaging || [],
        perPage: responseData.data.perPage || limit,
        totalPage: responseData.data.totalPage || 1,
        totalData: responseData.data.totalData || 0,
        currentPage: responseData.data.currentPage || page,
      },
      total: responseData.data.totalData || 0,
    };
  } catch (error: any) {
    console.error('Failed to fetch tasks:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const fetchTaskByIdFromAPI = async (taskId: string): Promise<Task> => {
  try {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data.data;
  } catch (error: any) {
    console.error(`Failed to fetch task ${taskId}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

export const createTaskInAPI = async (
  task: { title: string; description: string; status: TASK_STATUS; dueDate: string }
): Promise<Task> => {
  try {
    const response = await apiClient.post('/tasks', {
      title: task.title,
      description: task.description,
      status: task.status.toUpperCase(),
      dueDate: task.dueDate,
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to create task:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const updateTaskInAPI = async (
  taskId: string,
  updates: { title?: string; description?: string; status?: TASK_STATUS; dueDate?: string }
): Promise<Task> => {
  try {
    const apiUpdates = {
      ...updates,
      status: updates.status ? updates.status.toUpperCase() : undefined,
    };

    const response = await apiClient.put(`/tasks/${taskId}`, apiUpdates);
    return response.data.data;
  } catch (error: any) {
    console.error(`Failed to update task ${taskId}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

export const deleteTaskFromAPI = async (taskId: string): Promise<void> => {
  try {
    await apiClient.delete(`/tasks/${taskId}`);
  } catch (error: any) {
    console.error(`Failed to delete task ${taskId}:`, error.response?.data?.message || error.message);
    throw error;
  }
};
