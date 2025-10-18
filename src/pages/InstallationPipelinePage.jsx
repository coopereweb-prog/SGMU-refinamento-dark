import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KanbanBoard } from "@/components/admin/KanbanBoard";

export function InstallationPipelinePage() {
  return (
    <div className="h-full flex flex-col min-h-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle>Pipeline de Instalação</CardTitle>
        <CardDescription>
          Gerencie o fluxo de trabalho de instalação de placas, desde a arte até a conclusão.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 min-h-0">
        <KanbanBoard className="h-full" />
      </CardContent>
    </div>
  );
}
