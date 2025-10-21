import { useState, useEffect, useMemo } from "react";
import {
  getInstallationTasks,
  updateInstallationTaskStatus,
  getFieldTechnicians,
} from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanColumn } from "./KanbanColumn";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { cn } from "@/lib/utils";

const columnsConfig = [
  { id: "pending_art", title: "Aprovação da Arte" },
  { id: "art_approved", title: "Impressão dos Adesivos" },
  { id: "pending_assignment", title: "Pronto para Atribuir" },
  { id: "assigned", title: "Em Campo" },
  { id: "completed", title: "Concluído" },
  { id: "on_hold", title: "Em Espera" }
];

export function KanbanBoard({ className }) {
  const [tasks, setTasks] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
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
        toast.error("Falha ao carregar dados do painel", {
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const tasksByColumn = useMemo(() => {
    const grouped = {};
    for (const c of columnsConfig) grouped[c.id] = [];
    for (const t of tasks) {
      if (Object.prototype.hasOwnProperty.call(grouped, t.status)) {
        grouped[t.status].push(t);
      }
    }
    return grouped;
  }, [tasks]);

  const handleTaskUpdate = (updatedTask) => {
    setTasks((cur) =>
      cur.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
    );
  };

  const handleOpenModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskMove = async (taskId, newStatus) => {
    const originalTask = tasks.find((t) => t.id === taskId);
    if (!originalTask || originalTask.status === newStatus) return;

    // Regra de Negócio: Não pode ir para 'assigned' sem técnico e kit_type
    if (newStatus === "assigned") {
      if (!originalTask.assigned_technician_id) {
        toast.warning(
          "Atribua um técnico antes de mover a tarefa para 'Em Campo'."
        );
        return;
      }
      if (!originalTask.kit_type) {
        toast.warning(
          "Defina o Tipo de Kit no modal de detalhes antes de mover a tarefa para 'Em Campo'."
        );
        return;
      }
    }

    const snapshot = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateInstallationTaskStatus(taskId, newStatus);
      const col = columnsConfig.find((c) => c.id === newStatus);
      toast.success(`Tarefa movida para "${col ? col.title : newStatus}"`);
    } catch (error) {
      setTasks(snapshot);
      toast.error("Falha ao mover tarefa", { description: error.message });
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
    <div className={cn("h-full min-h-0", className)}>
      <div className="hidden md:flex h-full min-h-0">
        <ScrollArea className="w-full h-full min-h-0">
          <div className="flex gap-4 p-4 h-full min-h-0 min-w-fit">
            {columnsConfig.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id] || []}
                technicians={technicians}
                onTaskUpdate={handleTaskUpdate}
                onOpenModal={handleOpenModal}
                onTaskMove={handleTaskMove}
                allColumns={columnsConfig}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="block md:hidden h-full min-h-0">
        <Tabs defaultValue="pending_art" className="h-full flex flex-col min-h-0">
          <TabsList className="w-full sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
            <ScrollArea className="w-full">
              <div className="flex">
                {columnsConfig.map((column) => (
                  <TabsTrigger
                    key={column.id}
                    value={column.id}
                    className="flex-shrink-0"
                  >
                    {column.title} ({tasksByColumn[column.id]?.length || 0})
                  </TabsTrigger>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsList>

          <div className="flex-grow overflow-hidden">
            {columnsConfig.map((column) => (
              <TabsContent
                key={column.id}
                value={column.id}
                className="h-full mt-0 p-4 pt-0"
              >
                <KanbanColumn
                  column={column}
                  tasks={tasksByColumn[column.id] || []}
                  technicians={technicians}
                  onTaskUpdate={handleTaskUpdate}
                  onOpenModal={handleOpenModal}
                  onTaskMove={handleTaskMove}
                  allColumns={columnsConfig}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      <TaskDetailsModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleTaskUpdate}
      />
    </div>
  );
}