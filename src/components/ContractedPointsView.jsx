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

// Reduzido para 9, um número mais seguro para a API de URL do Google Maps
const ROUTE_CHUNK_SIZE = 9;

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

  const pointChunks = useMemo(() => {
    const chunks = [];
    if (selectedPoints.length > 0) {
      for (let i = 0; i < selectedPoints.length; i += ROUTE_CHUNK_SIZE) {
        chunks.push(selectedPoints.slice(i, i + ROUTE_CHUNK_SIZE));
      }
    }
    return chunks;
  }, [selectedPoints]);

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
  
  const handleGenerateRoute = (pointsToRoute) => {
    const pointsWithCoords = pointsToRoute.filter(p => p.latitude && p.longitude);
    const routeUrl = generateOptimizedRouteUrl(pointsWithCoords);
    if (routeUrl) {
      window.open(routeUrl, '_blank');
    }
  };

  if (contractedPoints.length === 0) {
    return (
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Meus Pontos Contratados</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Info className="mx-auto h-8 w-8 text-gray-400 mb-4" />
            <p className="text-gray-500">Você ainda não possui nenhum ponto contratado.</p>
            <p className="text-sm text-gray-400 mt-1">Seus pontos de pedidos concluídos aparecerão aqui.</p>
          </CardContent>
        </Card>
      </div>
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
            
            {selectedPoints.length > 0 && (
              <>
                {selectedPoints.length <= ROUTE_CHUNK_SIZE ? (
                  <Button onClick={() => handleGenerateRoute(selectedPoints)}>
                    <Map className="h-4 w-4 mr-2" /> Gerar Rota
                  </Button>
                ) : (
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        <Map className="h-4 w-4 mr-2" /> Gerar Rotas ({pointChunks.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {pointChunks.map((chunk, index) => {
                        const startPointNumber = index * ROUTE_CHUNK_SIZE + 1;
                        const endPointNumber = startPointNumber + chunk.length - 1;
                        return (
                          <DropdownMenuItem key={index} onClick={() => handleGenerateRoute(chunk)}>
                            Rota {index + 1} (Pontos {startPointNumber} a {endPointNumber})
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-2">
                    <Checkbox
                      checked={selectedPointIds.size === contractedPoints.length && contractedPoints.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Ponto</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractedPoints.map(point => (
                  <TableRow key={point.uniqueId}>
                    <TableCell className="p-2">
                      <Checkbox
                        checked={selectedPointIds.has(point.uniqueId)}
                        onCheckedChange={(checked) => handleSelectOne(point.uniqueId, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{point.name}</TableCell>
                    <TableCell>
                      {format(point.startDate, 'dd/MM/yy', { locale: ptBR })} - {format(point.endDate, 'dd/MM/yy', { locale: ptBR })}
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
        {reportData && <PrintablePointsReport {...reportData} />}
      </div>
    </div>
  );
}