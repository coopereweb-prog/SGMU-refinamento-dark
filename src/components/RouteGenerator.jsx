import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Map, Share2, Copy, Mail, MessageSquare } from 'lucide-react';
import { generateOptimizedRouteUrl } from '@/lib/maps-utils';
import { toast } from 'sonner';
import { RoutePlannerModal } from './RoutePlannerModal'; // Importação do novo modal

export function RouteGenerator({ points }) {
  const [selectedPointIds, setSelectedPointIds] = useState(new Set());
  const [isPlannerOpen, setIsPlannerOpen] = useState(false); // Estado para controlar o modal

  const handleToggleAll = (checked) => {
    if (checked) {
      setSelectedPointIds(new Set(points.map(p => p.id)));
    } else {
      setSelectedPointIds(new Set());
    }
  };

  const handleToggleOne = (pointId, checked) => {
    const newSet = new Set(selectedPointIds);
    if (checked) {
      newSet.add(pointId);
    } else {
      newSet.delete(pointId);
    }
    setSelectedPointIds(newSet);
  };

  const selectedPoints = useMemo(() => {
    return points.filter(p => selectedPointIds.has(p.id));
  }, [points, selectedPointIds]);

  const handleGenerateRoute = () => {
    if (selectedPoints.length > 0) {
      setIsPlannerOpen(true); // Abre o modal
    }
  };

  const handleShare = async (platform) => {
    const routeUrl = generateOptimizedRouteUrl(selectedPoints); // Gera URL simples para compartilhamento
    if (!routeUrl) return;

    const shareText = `Confira esta rota otimizada: ${routeUrl}`;

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: 'Rota Otimizada',
          text: 'Confira esta rota para os pontos selecionados.',
          url: routeUrl,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        toast.error("Não foi possível usar o compartilhamento nativo.");
      }
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(routeUrl);
      toast.success("Link da rota copiado para a área de transferência!");
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'email') {
      window.open(`mailto:?subject=Rota Otimizada&body=${encodeURIComponent(shareText)}`);
    }
  };

  if (!points || points.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Gerador de Rota</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-points"
                checked={selectedPointIds.size === points.length && points.length > 0}
                onCheckedChange={handleToggleAll}
              />
              <Label htmlFor="select-all-points" className="font-semibold">Selecionar Todos os Pontos</Label>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto border p-2 rounded-md">
              {points.map(point => (
                <div key={point.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`point-${point.id}`}
                    checked={selectedPointIds.has(point.id)}
                    onCheckedChange={(checked) => handleToggleOne(point.id, checked)}
                  />
                  <Label htmlFor={`point-${point.id}`} className="text-sm font-normal">{point.name}</Label>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleGenerateRoute} disabled={selectedPoints.length === 0} className="flex-1">
                <Map className="h-4 w-4 mr-2" /> Gerar Rota
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={selectedPoints.length === 0}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare('native')}><Share2 className="h-4 w-4 mr-2" />Compartilhar...</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('copy')}><Copy className="h-4 w-4 mr-2" />Copiar Link</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('whatsapp')}><MessageSquare className="h-4 w-4 mr-2" />WhatsApp</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('email')}><Mail className="h-4 w-4 mr-2" />Email</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
      <RoutePlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        points={selectedPoints}
      />
    </>
  );
}