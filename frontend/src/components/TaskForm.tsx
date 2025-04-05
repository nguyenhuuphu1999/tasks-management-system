
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Task, TASK_STATUS, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogFooter } from '@/components/ui/dialog';
import apiClient from '@/api/apiClient';

// Schema for form validation
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum([TASK_STATUS.TODO, TASK_STATUS.INPROGRESS, TASK_STATUS.COMPLETED]),
  dueDate: z.date({
    required_error: 'Due date is required',
  }),
  userId: z.string().min(1, 'User ID is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  userId: string;
  onSubmit: (taskData: TaskFormData) => void;
  onCancel: () => void;
  isAdmin?: boolean;
}

const TaskForm = ({ task, userId, onSubmit, onCancel, isAdmin = false }: TaskFormProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users when component mounts if admin
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/users');
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Fallback to mock users if API fails
      setUsers([
        { id: '1', username: 'User 1', email: 'user1@example.com', role: 'user' },
        { id: '2', username: 'User 2', email: 'user2@example.com', role: 'user' },
        { id: '3', username: 'User 3', email: 'user3@example.com', role: 'user' },
        { id: '4', username: 'User 4', email: 'user4@example.com', role: 'user' },
        { id: '5', username: 'User 5', email: 'user5@example.com', role: 'user' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize the form with default values
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: new Date(task.dueDate),
          userId: task.userId,
        }
      : {
          title: '',
          description: '',
          status: TASK_STATUS.TODO,
          dueDate: new Date(),
          userId: userId, // Ensure userId is always set by default
        },
  });

  // This ensures form is updated if task prop changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: new Date(task.dueDate),
        userId: task.userId,
      });
    }
  }, [task, form]);

  const handleSubmit = (data: TaskFormData) => {
    // Ensure userId is always included
    onSubmit({
      ...data,
      userId: data.userId || userId, // Fallback to the prop userId if not set in form
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Task description" {...field} className="resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="z-50 bg-background">
                  <SelectItem value={TASK_STATUS.TODO}>To Do</SelectItem>
                  <SelectItem value={TASK_STATUS.INPROGRESS}>In Progress</SelectItem>
                  <SelectItem value={TASK_STATUS.COMPLETED}>Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50 bg-background" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {isAdmin && (
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign to User</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-50 bg-background">
                    {isLoading ? (
                      <SelectItem value="" disabled>
                        Loading users...
                      </SelectItem>
                    ) : users.length > 0 ? (
                      users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center">
                            <UserRound className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{user.username || user.email}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No users found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="mr-2">
            Cancel
          </Button>
          <Button type="submit">{task ? 'Update Task' : 'Create Task'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default TaskForm;
