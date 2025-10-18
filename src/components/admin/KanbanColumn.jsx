import { useDroppable } from '@dnd-kit/core';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

export function KanbanColumn({ column, tasks, technicians, onTaskUpdate, onOpenModal }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center justify-between p-3 bg-muted rounded-t-lg border-b">
        <h3 className="font-semibold text-sm">{column.title}</h3>
        <span className="text-xs font-mono bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center rounded-full">
          {tasks.length}
        </span>
      </div>
      <ScrollArea
        ref={setNodeRef} // O ScrollArea é o Droppable
        className={cn(
          "h-full bg-muted/50 rounded-b-lg transition-colors",
          isOver && "bg-primary/10"
        )}
      >
        {/* CORREÇÃO FUNCIONAL: Adiciona minHeight para garantir que a coluna seja detectada
           mesmo quando está vazia ou no limite da ScrollArea. */}
        <div 
          className="p-2 space-y-2"
          style={{ minHeight: '150px' }} 
        >
          {tasks.length > 0 ? (
            tasks.map(task => (
              <KanbanCard 
                key={task.id} 
                task={task} 
                technicians={technicians}
                onTaskUpdate={onTaskUpdate}
                onOpenModal={onOpenModal}
              />
            ))
          ) : (
            // Placeholder para manter a altura quando não houver tarefas
            <div className="flex items-center justify-center h-full" style={{ minHeight: '150px' }}>
                <p className="text-xs text-center text-muted-foreground p-4">Nenhuma tarefa aqui.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}