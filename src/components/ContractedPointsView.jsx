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
import { generateOptimizedRouteUrl } from '@/lib/maps-utils'; // Nenhuma alteração aqui
import { toast } from 'sonner';

// NOVO: Definimos o tamanho máximo de cada rota para facilitar a manutenção.
const ROUTE_CHUNK_SIZE = 15;

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

  // NOVO: Lógica para "fatiar" os pontos selecionados em pedaços de 15.
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
  
  // NOVO: Função para gerar rotas que aceita um conjunto específico de pontos.
  const handleGenerateRoute = (pointsToRoute) => {
    const pointsWithCoords = pointsToRoute.filter(p => p.latitude && p.longitude);
    const routeUrl = generateOptimizedRouteUrl(pointsWithCoords);
    if (routeUrl) {
      window.open(routeUrl, '_blank');
    }
  };

  // Lógica de compartilhamento permanece a mesma, pode ser adaptada se necessário
  // ...

  if (contractedPoints.length === 0) {
    // ... (nenhuma alteração aqui)
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
            
            {/* // ALTERADO: Lógica de renderização condicional para os botões de rota */}
            {selectedPoints.length > 0 && (
              <>
                {/* Se tiver 15 ou menos pontos, mostra um botão só */}
                {selectedPoints.length <= ROUTE_CHUNK_SIZE && (
                  <Button onClick={() => handleGenerateRoute(selectedPoints)}>
                    <Map className="h-4 w-4 mr-2" /> Gerar Rota
                  </Button>
                )}

                {/* Se tiver mais de 15, mostra botões "fatiados" */}
                {selectedPoints.length > ROUTE_CHUNK_SIZE && (
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

            {/* O botão de compartilhar pode continuar aqui ou ser movido */}
          </div>
          <div className="border rounded-lg">
            <Table>
              {/* ... (O resto da tabela permanece inalterado) ... */}
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* ... (O resto do componente permanece inalterado) ... */}
    </div>
  );
}