import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { assignTaskToTechnician } from '@/lib/supabase';
import { toast } from 'sonner';

export function KanbanCard({ task, technicians, onTaskUpdate }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });
  const [assigning, setAssigning] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleAssign = async (technicianId) => {
    if (!technicianId) return;
    setAssigning(true);
    try {
      const updatedTask = await assignTaskToTechnician(task.id, technicianId);
      onTaskUpdate(updatedTask);
      toast.success(`Tarefa atribuída a ${updatedTask.technician_name}`);
      setPopoverOpen(false);
    } catch (error) {
      toast.error("Falha ao atribuir tarefa", { description: error.message });
    } finally {
      setAssigning(false);
    }
  };

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
        {task.status === 'pending_assignment' && (
          <div className="mt-2 pt-2 border-t">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-xs h-auto py-1 px-2">
                  <UserPlus className="h-3 w-3 mr-2" />
                  Atribuir Técnico
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar técnico..." />
                  <CommandList>
                    <CommandEmpty>Nenhum técnico encontrado.</CommandEmpty>
                    <CommandGroup>
                      {technicians.map((tech) => (
                        <CommandItem
                          key={tech.id}
                          value={tech.name}
                          onSelect={() => handleAssign(tech.id)}
                          disabled={assigning}
                          className="flex items-center"
                        >
                          {assigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <div className="mr-2 h-4 w-4" />}
                          {tech.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </CardContent>
    </Card>
  );
}