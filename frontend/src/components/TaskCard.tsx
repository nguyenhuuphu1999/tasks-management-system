
import { format } from 'date-fns';
import { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import TaskStatusBadge from '@/components/TaskStatusBadge';
import { Button } from '@/components/ui/button';
import { Calendar, Edit, Trash, User } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isAdminView?: boolean;
}

const TaskCard = ({ task, onEdit, onDelete, isAdminView = false }: TaskCardProps) => {
  return (
    <Card className={`w-full mb-4 ${isAdminView ? 'border-l-4 border-l-purple-500' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">{task.title}</CardTitle>
          <TaskStatusBadge status={task.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{task.description}</p>
        <div className="flex items-center text-muted-foreground text-sm space-y-1 flex-col items-start">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Due: {format(new Date(task.dueDate), 'PPP')}</span>
          </div>
          
          {isAdminView && (
            <div className="flex items-center text-purple-500">
              <User className="h-4 w-4 mr-1" />
              <span>User ID: {task.userId}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button variant="outline" size="sm" className="text-destructive" onClick={() => onDelete(task.id)}>
          <Trash className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
