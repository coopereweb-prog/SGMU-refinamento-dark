import { useState, useEffect, useMemo } from 'react';
import { getInstallationTasks } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { KanbanColumn } from './KanbanColumn';

const columnsConfig = [
  { id: 'pending_art', title: 'Aprovação da Arte' },
  { id: 'art_approved', title: 'Arte Aprovada' },
  { id: 'pending_assignment', title: 'Pronto para Atribuir' },
  { id: 'assigned', title: 'Em Campo' },
  { id: 'completed', title: 'Concluído' },
  { id: 'on_hold', title: 'Em Espera' },
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await getInstallationTasks();
        setTasks(tasksData);
      } catch (error) {
        toast.error("Falha ao carregar tarefas", { description: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const tasksByColumn = useMemo(() => {
    const groupedTasks = {};
    columnsConfig.forEach(col => {
      groupedTasks[col.id] = [];
    });
    tasks.forEach(task => {
      if (groupedTasks[task.status]) {
        groupedTasks[task.status].push(task);
      }
    });
    return groupedTasks;
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando tarefas...</span>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-4 p-4 h-[calc(100vh-200px)]">
        {columnsConfig.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id]}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}