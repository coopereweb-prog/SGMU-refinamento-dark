import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function MapSettingsForm({
  globalSettings,
  onGlobalSettingsChange,
  activeRule,
  onRuleChange,
  isRuleActive,
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Globais</CardTitle>
          <CardDescription>Estas regras afetam o mapa inteiro, em todos os níveis de zoom.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="cluster-count-logic" className="text-base">Contagem do Cluster</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar apenas pontos <span className="font-bold text-green-600">disponíveis</span> no contador do cluster.
              </p>
            </div>
            <Switch
              id="cluster-count-logic"
              checked={globalSettings.cluster_count_logic === 'available_only'}
              onCheckedChange={(checked) => onGlobalSettingsChange('cluster_count_logic', checked ? 'available_only' : 'total_points')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras para o Nível de Zoom {activeRule.zoom_level}</CardTitle>
          <CardDescription>Ajuste como os pontos são exibidos neste nível de zoom específico.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <Label className="text-base">Modo de Exibição</Label>
            <RadioGroup
              value={activeRule.display_mode}
              onValueChange={(value) => onRuleChange('display_mode', value)}
              className="mt-2 grid grid-cols-2 gap-4"
            >
              <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="cluster" className="sr-only" />
                <span className="text-2xl">🌀</span>
                <span className="mt-2 font-semibold">Agrupar (Cluster)</span>
              </Label>
              <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="individual" className="sr-only" />
                <span className="text-2xl">📍</span>
                <span className="mt-2 font-semibold">Pontos Individuais</span>
              </Label>
            </RadioGroup>
          </div>

          {isRuleActive && activeRule.display_mode === 'cluster' && (
            <div className="space-y-8 animate-in fade-in-0 duration-300">
              <div>
                <Label htmlFor="cluster-radius" className="text-base">Raio de Agrupamento</Label>
                <p className="text-sm text-muted-foreground mb-2">Distância em que os pontos se juntam. Maior valor = mais agrupado.</p>
                <div className="flex items-center gap-4">
                  <Slider
                    id="cluster-radius"
                    min={20}
                    max={100}
                    step={5}
                    value={[activeRule.cluster_radius]}
                    onValueChange={([value]) => onRuleChange('cluster_radius', value)}
                  />
                  <Input
                    type="number"
                    className="w-20"
                    value={activeRule.cluster_radius}
                    onChange={(e) => onRuleChange('cluster_radius', Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="min-cluster-size" className="text-base">Tamanho Mínimo do Cluster</Label>
                <p className="text-sm text-muted-foreground mb-2">Número mínimo de pontos para formar um grupo.</p>
                <div className="flex items-center gap-4">
                  <Slider
                    id="min-cluster-size"
                    min={2}
                    max={10}
                    step={1}
                    value={[activeRule.min_cluster_size]}
                    onValueChange={([value]) => onRuleChange('min_cluster_size', value)}
                  />
                  <Input
                    type="number"
                    className="w-20"
                    value={activeRule.min_cluster_size}
                    onChange={(e) => onRuleChange('min_cluster_size', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}