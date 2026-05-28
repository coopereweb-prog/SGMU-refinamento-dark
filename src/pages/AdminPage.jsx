import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RuleManager } from "@/components/admin/RuleManager";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function AdminPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
        <Button asChild>
          <Link to="/">Voltar ao Mapa</Link>
        </Button>
      </header>
      <Tabs defaultValue="rules">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rules">Gerenciar Regras</TabsTrigger>
          <TabsTrigger value="settings">Configurações Gerais</TabsTrigger>
        </TabsList>
        <TabsContent value="rules" className="mt-4">
          <RuleManager />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <SettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminPage;