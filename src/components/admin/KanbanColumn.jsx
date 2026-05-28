import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanCard } from "./KanbanCard";

export function KanbanColumn({
  column,
  tasks,
  technicians,
  onTaskUpdate,
  onOpenModal,
  onTaskMove,
  allColumns,
}) {
  return (
    // largura fixa, não encolhe, permite filhos encolherem
    <div className="flex flex-col w-72 flex-none min-w-0 h-full">
      <div className="flex items-center justify-between p-3 bg-muted rounded-t-lg border-b flex-shrink-0 w-full">
        <h3 className="font-semibold text-sm truncate">{column.title}</h3>
        <span className="text-xs font-mono bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center rounded-full">
          {tasks.length}
        </span>
      </div>

      <ScrollArea className="flex-grow bg-muted/50 rounded-b-lg w-full">
        <div className="p-2 space-y-2 w-full" style={{ minHeight: "150px" }}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                technicians={technicians}
                onTaskUpdate={onTaskUpdate}
                onOpenModal={onOpenModal}
                onTaskMove={onTaskMove}
                allColumns={allColumns}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full" style={{ minHeight: "150px" }}>
              <p className="text-xs text-center text-muted-foreground p-4">
                Nenhuma tarefa aqui.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
