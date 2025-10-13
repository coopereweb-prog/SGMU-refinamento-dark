import { useState, useMemo } from 'react';
import { addYears, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PrintablePointsReport } from '@/components/PrintablePointsReport';
import { FileText, Info, Map, Share2, Copy, Mail, MessageSquare } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { generateOptimizedRouteUrl } from '@/lib/maps-utils';
import { toast } from 'sonner';

export function ContractedPointsView({ orders, profile }) {
  const [selectedPointIds, setSelectedPointIds] = useState(new Set());
  const [reportData, setReportData] = useState(null);

  const contractedPoints = useMemo(() => {
    if (!orders) return [];
    return orders.flatMap(order => 
      order.order_items.map(item => ({
        ...item.points,
        uniqueId: `${order.id}-${item.id}`, 
        price: item.price,
        period_years: item.period_years,
        startDate: new Date(order.updated_at), 
        endDate: addYears(new Date(order.updated_at), item.period_years),
      }))
    );
  }, [orders]);

  const selectedPoints = useMemo(() => {
    return contractedPoints.filter(p => selectedPointIds.has(p.uniqueId));
  }, [contractedPoints, selectedPointIds]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPointIds(new Set(contractedPoints.map(p => p.uniqueId)));
    } else {
      setSelectedPointIds(new Set());
    }
  };

  const handleSelectOne = (pointId, checked) => {
    const newSet = new Set(selectedPointIds);
    if (checked) {
      newSet.add(pointId);
    } else {
      newSet.delete(pointId);
    }
    setSelectedPointIds(newSet);
  };

  const handleGenerateReport = () => {
    setReportData({ points: selectedPoints, profile });
    setTimeout(() => {
      window.print();
      setReportData(null);
    }, 100);
  };

  const routeUrl = useMemo(() => {
    // Filtra pontos sem latitude ou longitude válidas antes de gerar a URL
    const pointsWithCoords = selectedPoints.filter(p => p.latitude && p.longitude);
    return generateOptimizedRouteUrl(pointsWithCoords);
  }, [selectedPoints]);

  const handleGenerateRoute = () => {
    if (routeUrl) {
      window.open(routeUrl, '_blank');
    }
  };

  const handleShare = async (platform) => {
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

  if (contractedPoints.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="text-center py-12">
          <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold">Nenhum Ponto Contratado</h3>
          <p className="text-gray-500 mt-2">Você ainda não possui pontos de pedidos concluídos.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Meus Pontos Contratados</CardTitle>
          <CardDescription>
            Aqui está uma lista consolidada de todos os seus pontos de pedidos concluídos. Selecione os pontos abaixo para gerar rotas ou relatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Button onClick={handleGenerateReport} disabled={selectedPoints.length === 0}>
              <FileText className="h-4 w-4 mr-2" /> Gerar Relatório
            </Button>
            <Button onClick={handleGenerateRoute} disabled={selectedPoints.length === 0}>
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
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedPointIds.size === contractedPoints.length && contractedPoints.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead>Ponto</TableHead>
                  <TableHead>Período de Vigência</TableHead>
                  <TableHead className="text-right">Valor Pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractedPoints.map((point) => (
                  <TableRow key={point.uniqueId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPointIds.has(point.uniqueId)}
                        onCheckedChange={(checked) => handleSelectOne(point.uniqueId, checked)}
                        aria-label={`Selecionar ${point.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{point.name}</TableCell>
                    <TableCell>
                      {format(point.startDate, 'dd/MM/yyyy', { locale: ptBR })} - {format(point.endDate, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(point.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="hidden print:block">
        {reportData && <PrintablePointsReport points={reportData.points} profile={reportData.profile} />}
      </div>
    </div>
  );
}