import { useState, useEffect, useMemo } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { getInstallationTasks, updateInstallationTaskStatus, getFieldTechnicians } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { TaskDetailsModal } from './TaskDetailsModal';

const columnsConfig = [
  { id: 'pending_art', title: 'Aprovação da Arte' },
  { id: 'art_approved', title: 'Impressão dos Adesivos' },
  { id: 'pending_assignment', title: 'Pronto para Atribuir' },
  { id: 'assigned', title: 'Em Campo' },
  { id: 'completed', title: 'Concluído' },
  { id: 'on_hold', title: 'Em Espera' },
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [tasksData, techniciansData] = await Promise.all([
          getInstallationTasks(),
          getFieldTechnicians()
        ]);
        setTasks(tasksData);
        setTechnicians(techniciansData);
      } catch (error) {
        toast.error("Falha ao carregar dados do painel", { description: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const tasksByColumn = useMemo(() => {
    const groupedTasks = {};
    columnsConfig.forEach(col => {
      // Inicializa cada coluna com um array vazio
      groupedTasks[col.id] = []; 
    });
    tasks.forEach(task => {
      // Garante que só tarefas com status válido sejam incluídas
      if (groupedTasks.hasOwnProperty(task.status)) {
        groupedTasks[task.status].push(task);
      }
    });
    return groupedTasks;
  }, [tasks]);

  const handleTaskUpdate = (updatedTask) => {
    setTasks(currentTasks => 
      currentTasks.map(task => task.id === updatedTask.id ? { ...task, ...updatedTask } : task)
    );
  };

  const handleOpenModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDragStart = (event) => {
    // Armazena o objeto completo da tarefa ativa para uso no DragOverlay
    setActiveTask(event.active.data.current);
  };

  const handleDragEnd = async (event) => {
    setActiveTask(null);
    const { active, over } = event;

    // Se não soltou sobre um droppable ou soltou no próprio local
    if (!over || active.id === over.id) return;

    const taskId = active.id;
    const newStatus = over.id; // O id do droppable (KanbanColumn) é o novo status
    const originalTask = tasks.find(t => t.id === taskId);

    if (!originalTask) return;

    // **LÓGICA CORRIGIDA:** Garante que qualquer transição para 'Em Campo' tenha um técnico atribuído.
    if (newStatus === 'assigned' && !originalTask.assigned_technician_id) {
      toast.warning("Atribua um técnico antes de mover a tarefa para 'Em Campo'.");
      return;
    }

    if (originalTask.status !== newStatus) {
      const originalTasks = [...tasks];
      
      // Otimisticamente atualiza o estado
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
        // Reverte o estado em caso de falha na API
        setTasks(originalTasks);
        toast.error("Falha ao mover tarefa", { description: error.message });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando tarefas...</span>
      </div>
    );
  }

  return (
    <div className="h-full">
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        {/* Layout para Desktop */}
        <div className="hidden md:flex h-full">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 p-4 h-full">
              {columnsConfig.map(column => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByColumn[column.id] || []} // Fallback garantido para array vazio
                  technicians={technicians}
                  onTaskUpdate={handleTaskUpdate}
                  onOpenModal={handleOpenModal}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Layout para Mobile */}
        <div className="block md:hidden h-full">
          <Tabs defaultValue="pending_art" className="h-full flex flex-col">
            <TabsList className="w-full sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex">
                  {columnsConfig.map(column => (
                    <TabsTrigger key={column.id} value={column.id} className="flex-shrink-0">
                      {column.title} ({tasksByColumn[column.id]?.length || 0})
                    </TabsTrigger>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </TabsList>
            <div className="flex-grow overflow-y-auto p-4 pt-0">
                {columnsConfig.map(column => (
                <TabsContent 
                    key={column.id} 
                    value={column.id} 
                    className="h-full"
                >
                    <KanbanColumn
                        column={column}
                        tasks={tasksByColumn[column.id] || []}
                        technicians={technicians}
                        onTaskUpdate={handleTaskUpdate}
                        onOpenModal={handleOpenModal}
                    />
                </TabsContent>
                ))}
            </div>
          </Tabs>
        </div>

        {/* DragOverlay para exibir o cartão flutuante durante o arrasto */}
        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} technicians={technicians} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
      
      <TaskDetailsModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleTaskUpdate}
      />
    </div>
  );
}