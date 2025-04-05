
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export enum TASK_STATUS {
  TODO = 'TODO',
  INPROGRESS = 'INPROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TASK_STATUS;
  dueDate: string; // ISO string format
  createdAt: string;
  updatedAt: string;
}

export type SortDirection = 'asc' | 'desc';

export interface TaskFilter {
  status?: TASK_STATUS;
  sortBy?: 'dueDate';
  sortDirection?: SortDirection;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}
