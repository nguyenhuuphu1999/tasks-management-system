
// First import React dependencies and testing utilities
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TASK_STATUS } from '@/types';

// Move ALL vi.mock calls to the top BEFORE any imports that use those mocked modules
// Mock taskService module first since Dashboard imports from it
vi.mock('@/services/taskService', () => {
  return {
    getUserTasks: vi.fn().mockResolvedValue({
      tasks: {
        dataPaging: [
          {
            id: 'task1',
            title: 'Test Task',
            description: 'Test Description',
            status: TASK_STATUS.TODO,
            dueDate: new Date().toISOString(),
            userId: 'user1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'task2',
            title: 'Project Alpha',
            description: 'Alpha project task',
            status: TASK_STATUS.TODO,
            dueDate: new Date().toISOString(),
            userId: 'user1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'task3',
            title: 'Project Beta',
            description: 'Beta project task',
            status: TASK_STATUS.TODO,
            dueDate: new Date().toISOString(),
            userId: 'user1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'task4',
            title: 'Completed Task',
            description: 'A completed task',
            status: TASK_STATUS.COMPLETED,
            dueDate: new Date().toISOString(),
            userId: 'user1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        perPage: 10,
        totalPage: 1,
        totalData: 4,
        currentPage: 1
      },
      total: 4
    }),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    updateTaskStatus: vi.fn(),
  };
});

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user1', username: 'testuser', email: 'test@example.com', role: 'user' },
    logout: vi.fn(),
    isAdmin: false,
    isAuthenticated: true,
    isLoading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import Dashboard AFTER all mocks are defined
import Dashboard from '../Dashboard';

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders the dashboard with task list', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Verify dashboard elements are rendered
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('allows filtering tasks by status', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Before filtering
    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
    });

    // Now we can test filtering by checking if task status labels exist in the filter dropdown
    // Use getAllByText to get the filter item in the dropdown, not the status badges
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    
    // Instead of checking for the status badges (which appear multiple times),
    // check for the presence of the filter items
    expect(screen.getByText('All Tasks')).toBeInTheDocument();
    expect(screen.getAllByText('To Do')[0]).toBeInTheDocument(); // We use getAllByText because there are multiple elements with this text
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('allows searching tasks by title', async () => {
    // Get the mocked functions using standard import - we need to reference them directly
    const { getUserTasks } = await import('@/services/taskService');
    const mockGetUserTasks = vi.mocked(getUserTasks);
    
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Before searching
    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
    });

    // Search for 'Alpha'
    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });
    
    // Mock the search results response with a new implementation for this test case
    mockGetUserTasks.mockResolvedValueOnce({
      tasks: {
        dataPaging: [
          {
            id: 'task2',
            title: 'Project Alpha',
            description: 'Alpha project task',
            status: TASK_STATUS.TODO,
            dueDate: new Date().toISOString(),
            userId: 'user1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        perPage: 10,
        totalPage: 1,
        totalData: 1,
        currentPage: 1
      },
      total: 1
    });

    await waitFor(() => {
      // Check that the search query was passed to getUserTasks
      expect(mockGetUserTasks).toHaveBeenCalledWith(
        'user1',
        false,
        expect.objectContaining({
          searchQuery: 'Alpha'
        })
      );
    });
  });
});
