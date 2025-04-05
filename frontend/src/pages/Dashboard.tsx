
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Task, TASK_STATUS, TaskFilter } from '@/types';
import { getUserTasks, createTask, updateTask, deleteTask } from '@/services/taskService';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Filter, LogOut, Plus, Search, SortAsc, SortDesc, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filter, setFilter] = useState<TaskFilter>({
    sortBy: 'dueDate',
    sortDirection: 'asc',
    searchQuery: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    fetchTasks();
  }, [user, filter, isAdmin]);
  
  const fetchTasks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching tasks with filter:', filter);
      const result = await getUserTasks(user.id, isAdmin, filter);
      console.log('Tasks result:', result);
      
      // Safely handle the task data, ensuring it's an array
      if (result?.tasks?.dataPaging && Array.isArray(result.tasks.dataPaging)) {
        setTasks(result.tasks.dataPaging);
      } else {
        setTasks([]);
      }
    } catch (error) {
      // Error is already handled by the service with toast
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData: { 
    title: string; 
    description: string; 
    status: TASK_STATUS; 
    dueDate: Date;
    userId: string;
  }) => {
    try {
      await createTask({
        ...taskData,
        dueDate: taskData.dueDate.toISOString(),
      });
      
      setIsDialogOpen(false);
      toast.success('Task created successfully');
      fetchTasks();
    } catch (error) {
      // Error is already handled by the service with toast
      console.error('Failed to create task:', error);
      // We don't close the dialog so the user can fix the error and try again
    }
  };
  
  const handleUpdateTask = async (taskData: { 
    title: string; 
    description: string; 
    status: TASK_STATUS; 
    dueDate: Date;
    userId: string;
  }) => {
    if (!editingTask) return;
    
    try {
      await updateTask(editingTask.id, {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        dueDate: taskData.dueDate.toISOString(),
        userId: taskData.userId,
      });
      // setTasks(prevTasks => 
      //   prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
      // );
      
      setIsDialogOpen(false);
      setEditingTask(undefined);
      toast.success('Task updated successfully');
      await fetchTasks();

    } catch (error) {
      // Error is already handled by the service with toast
      console.error('Failed to update task:', error);
      // We don't close the dialog so the user can fix the error and try again
    }
  };
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      // Error is already handled by the service with toast
      console.error('Failed to delete task:', error);
    }
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTask(undefined);
  };
  
  const handleStatusFilterChange = (value: string) => {
    setFilter(prev => ({
      ...prev,
      status: value === 'all' ? undefined : value as TASK_STATUS,
    }));
  };
  
  const handleSortDirectionToggle = () => {
    setFilter(prev => ({
      ...prev,
      sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({
      ...prev,
      searchQuery: e.target.value,
    }));
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Welcome, {user.username}</span>
              {isAdmin && (
                <Badge variant="secondary" className="ml-2">
                  <Users className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  type="search" 
                  placeholder="Search tasks..." 
                  value={filter.searchQuery || ''}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select 
                  defaultValue="all" 
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value={TASK_STATUS.TODO}>To Do</SelectItem>
                    <SelectItem value={TASK_STATUS.INPROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TASK_STATUS.COMPLETED}>Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSortDirectionToggle}
                className="flex items-center gap-2"
              >
                {filter.sortDirection === 'asc' ? (
                  <>
                    <SortAsc className="h-4 w-4" />
                    <span>Earliest Due Date First</span>
                  </>
                ) : (
                  <>
                    <SortDesc className="h-4 w-4" />
                    <span>Latest Due Date First</span>
                  </>
                )}
              </Button>
            </div>
            
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-sky-500 bg-white transition ease-in-out duration-150">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading tasks...
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter.searchQuery ? 
                  `No tasks matching "${filter.searchQuery}"` : 
                  filter.status 
                    ? `No ${filter.status} tasks found. Try changing your filter.` 
                    : "Get started by creating your first task!"}
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add a new task
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  isAdminView={isAdmin && task.userId !== user.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            userId={user.id}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={handleDialogClose}
            isAdmin={isAdmin}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
