import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function InstallationPipelinePage() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Instalação</CardTitle>
          <CardDescription>
            Gerencie o fluxo de trabalho de instalação de placas, desde a arte até a conclusão.
          </CardDescription>
        </CardHeader>
        {/* O conteúdo do Kanban será adicionado aqui em breve. */}
      </Card>
    </div>
  );
}