
import { TASK_STATUS } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, ListTodo } from 'lucide-react';

interface TaskStatusBadgeProps {
  status: TASK_STATUS;
  className?: string;
}

const TaskStatusBadge = ({ status, className }: TaskStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case TASK_STATUS.TODO:
        return { 
          label: 'To Do', 
          icon: <ListTodo className="h-3 w-3 mr-1" />, 
          variant: 'outline',
          className: 'border-task-TODO text-task-TODO bg-task-TODO/10'
        };
      case TASK_STATUS.INPROGRESS:
        return { 
          label: 'In Progress', 
          icon: <Clock className="h-3 w-3 mr-1" />, 
          variant: 'outline',
          className: 'border-task-INPROGRESS text-task-INPROGRESS bg-task-INPROGRESS/10' 
        };
      case TASK_STATUS.COMPLETED:
        return { 
          label: 'Completed', 
          icon: <Check className="h-3 w-3 mr-1" />, 
          variant: 'outline',
          className: 'border-task-COMPLETED text-task-COMPLETED bg-task-COMPLETED/10' 
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant="outline" 
      className={cn('flex items-center font-normal', config.className, className)}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
};

export default TaskStatusBadge;
