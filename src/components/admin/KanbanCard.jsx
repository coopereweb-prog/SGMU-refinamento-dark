import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function KanbanCard({ task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: task, // Passa a tarefa inteira para o contexto de arrastar
  });

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "mb-2 bg-card/80 hover:bg-accent transition-all cursor-grab",
        isDragging && "opacity-50 shadow-lg scale-105"
      )}
    >
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-semibold">{task.point_name || 'Ponto não encontrado'}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-xs text-muted-foreground space-y-2">
        <div className="flex items-center">
          <User className="h-3 w-3 mr-2" />
          <span>{task.customer_name || 'Cliente não encontrado'}</span>
        </div>
        {task.technician_name && (
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-2" />
            <span>Téc: {task.technician_name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}