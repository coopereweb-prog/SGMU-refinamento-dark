import { useState, useEffect, useMemo } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { getInstallationTasks, updateInstallationTaskStatus } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

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
  const [activeTask, setActiveTask] = useState(null);

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

  const handleDragStart = (event) => {
    setActiveTask(event.active.data.current);
  };

  const handleDragEnd = async (event) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const taskId = active.id;
    const newStatus = over.id;
    const originalTask = tasks.find(t => t.id === taskId);

    if (originalTask && originalTask.status !== newStatus) {
      // Optimistic UI update
      const originalTasks = [...tasks];
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      try {
        await updateInstallationTaskStatus(taskId, newStatus);
        const newColumn = columnsConfig.find(c => c.id === newStatus);
        toast.success(`Tarefa movida para "${newColumn?.title || newStatus}"`);
      } catch (error) {
        // Revert UI on failure
        setTasks(originalTasks);
        toast.error("Falha ao mover tarefa", { description: error.message });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando tarefas...</span>
      </div>
    );
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
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
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}