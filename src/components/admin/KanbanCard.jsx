import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin, UserPlus, Loader2, FileImage, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { assignTaskToTechnician } from '@/lib/supabase';
import { toast } from 'sonner';

export function KanbanCard({ task, technicians, onTaskUpdate, onOpenModal, onTaskMove, allColumns }) {
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
      className="mb-2 bg-card/80 transition-all flex items-stretch cursor-pointer hover:bg-accent"
      onClick={() => onOpenModal(task)}
    >
      <div className="flex-grow min-w-0">
        <CardHeader className="p-3 flex-row items-start justify-between">
          <CardTitle className="text-sm font-semibold break-words pr-2">{task.point_name || 'Ponto não encontrado'}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Mover para...</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {allColumns.map(col => (
                      <DropdownMenuItem 
                        key={col.id} 
                        disabled={col.id === task.status}
                        onSelect={() => onTaskMove(task.id, col.id)}
                      >
                        {col.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-3 pt-0 text-xs text-muted-foreground space-y-2">
          <div className="flex items-center min-w-0">
            <User className="h-3 w-3 mr-2 flex-shrink-0" />
            <span className="break-words">{task.customer_name || 'Cliente não encontrado'}</span>
          </div>
          {task.art_file_url && (
            <a 
              href={task.art_file_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center min-w-0 text-blue-400 hover:underline"
            >
              <FileImage className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="break-words">Ver Arte</span>
            </a>
          )}
          {task.technician_name && (
            <div className="flex items-center min-w-0">
              <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="break-words">Téc: {task.technician_name}</span>
            </div>
          )}
          {task.status === 'pending_assignment' && (
            <div className="mt-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
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
                        {(technicians || []).map((tech) => (
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
      </div>
    </Card>
  );
}