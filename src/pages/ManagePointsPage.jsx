import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PointForm } from '@/components/PointForm';
import { Modal } from '@/components/Modal';
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, XCircle, MapPin, Loader2, CornerDownRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGoogleMapsLoader } from '@/contexts/GoogleMapsLoaderContext';
import { GoogleMap, Marker, MarkerClustererF } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMapConfig } from '@/contexts/MapConfigContext';
import { cn } from '@/lib/utils';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: -22.78,
  lng: -47.30
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

// Estados de seleção de rua
const SELECTION_STATE = {
  NONE: 0,
  AWAITING_LOCATION: 1, // Esperando o primeiro clique
  FORM_OPEN: 2, // Formulário aberto (para adição ou edição)
};

// Estilos de cluster (Amarelos, do seu código de adição)
const clusterStyles = [
  { url: 'data:image/svg+xml;charset=UTF-8,<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="23" fill="oklch(0.85 0.2 90)" stroke="oklch(0.145 0 0)" stroke-width="2"/><text x="25" y="30" font-family="sans-serif" font-size="16" fill="oklch(0.145 0 0)" text-anchor="middle" font-weight="bold"></text></svg>', height: 50, width: 50, textColor: 'oklch(0.145 0 0)', textSize: 16, fontWeight: 'bold' },
];

// Função auxiliar para truncar o nome
const truncateName = (name, maxLength = 150) => {
  if (!name) return '';
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

export function ManagePointsPage() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPoint, setEditingPoint] = useState(null); // Ponto em edição OU novo ponto
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pointToDelete, setPointToDelete] = useState(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [selectionState, setSelectionState] = useState(SELECTION_STATE.NONE);
  const [currentZoom, setCurrentZoom] = useState(14);
  const [mapInstance, setMapInstance] = useState(null);
  
  const { isLoaded } = useGoogleMapsLoader();
  const { rules, loading: loadingConfig } = useMapConfig();
  
  // NÍVEL DE ZOOM (como você pediu, mais próximo)
  const DETAILED_ZOOM_LEVEL = 21;

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const pageSize = 1000;
      let from = 0;
      let to = pageSize - 1;
      let all = [];
      for (;;) {
        const { data, error } = await supabase
          .from('points')
          .select('*')
          .order('updated_at', { ascending: false })
          .range(from, to);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
        to += pageSize;
      }
      setPoints(all);
    } catch (error) {
      console.error('Error fetching points:', error);
      toast.error("Erro", { description: "Não foi possível carregar os pontos." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  // FLUXO DE ADIÇÃO (Início)
  const handleAddNew = () => {
    setEditingPoint(null); // Garante que não há ponto em edição
    setIsAddingMode(true);
    setSelectionState(SELECTION_STATE.AWAITING_LOCATION); // Estado 1: Esperando clique
    
    // Centraliza no default ao iniciar a adição
    if (mapInstance) {
      mapInstance.panTo(defaultCenter);
      mapInstance.setZoom(14); // Zoom inicial padrão
    }
  };

  // FLUXO DE EDIÇÃO (Início)
  const handleEdit = (point) => {
    setIsAddingMode(false); // Garante que não está em modo de adição
    setSelectionState(SELECTION_STATE.FORM_OPEN); // Estado 2: Formulário já abre
    setEditingPoint(point); // Define o ponto para o formulário
    
    // Centraliza o mapa no ponto com o zoom detalhado
    if (mapInstance && point.latitude && point.longitude) {
      mapInstance.panTo({ lat: Number(point.latitude), lng: Number(point.longitude) });
      mapInstance.setZoom(DETAILED_ZOOM_LEVEL); // <--- ZOOM DE EDIÇÃO (21)
    }
  };
  
  // BOTÃO CANCELAR (Universal)
  const handleCancelEdit = () => {
    setIsAddingMode(false);
    setEditingPoint(null);
    setSelectionState(SELECTION_STATE.NONE);
  };

  // Função do Geocoder (usada por ambos os fluxos)
  const getAddressDetailsFromCoords = (lat, lng, callback) => {
    if (!isLoaded) {
      toast.warning("Serviço de mapas não carregado. Tente novamente.");
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      let streetName = '';
      let neighborhood = '';
      
      if (status === 'OK' && results.length > 0) {
        const components = results[0].address_components;
        
        const routeComponent = components.find(c => c.types.includes('route'));
        streetName = routeComponent ? routeComponent.long_name : '';

        const neighborhoodComponent = components.find(c => c.types.includes('sublocality') || c.types.includes('sublocality_level_1'));
        neighborhood = neighborhoodComponent ? neighborhoodComponent.long_name : '';

        if (!streetName) {
          streetName = results[0].formatted_address;
        }
      } else {
        toast.warning("Não foi possível encontrar o nome da rua. Por favor, insira manualmente.");
      }
      callback({ streetName, neighborhood });
    });
  };

  // CLIQUE NO MAPA (Lógica principal de Adição)
  const handleMapClick = (e) => {
    if (selectionState === SELECTION_STATE.NONE) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    // FLUXO DE ADIÇÃO (1º Clique)
    if (selectionState === SELECTION_STATE.AWAITING_LOCATION) {
      getAddressDetailsFromCoords(lat, lng, ({ streetName, neighborhood }) => {
        setEditingPoint({ 
          latitude: lat, 
          longitude: lng, 
          street_name: streetName,
          intersection_name: '',
          name: streetName,
          description: '',
          pricing_tier_id: '',
          is_available: true,
          image_url: '',
          _temp_neighborhood: neighborhood, 
        });
        setSelectionState(SELECTION_STATE.FORM_OPEN); // Muda para o Estado 2
        toast.info(`Localização principal definida: ${streetName}. Clique no mapa novamente para definir o cruzamento (opcional).`);
      });
    } 
    // FLUXO DE ADIÇÃO (2º Clique) E FLUXO DE EDIÇÃO (Qualquer clique)
    else if (selectionState === SELECTION_STATE.FORM_OPEN && editingPoint) {
      getAddressDetailsFromCoords(lat, lng, ({ streetName: intersectionName }) => {
        setEditingPoint(prev => ({
          ...prev,
          intersection_name: intersectionName,
        }));
        toast.success(`Rua do Cruzamento sugerida: ${intersectionName}. Ajuste no formulário se necessário.`);
      });
    }
  };

  // SALVAR (Universal - Novo ou Edição)
  const handleSavePoint = async (pointData, tagIds) => {
    try {
      let savedPoint;
      if (editingPoint && editingPoint.id) {
        // MODO EDIÇÃO
        const { data, error } = await supabase.from('points').update(pointData).eq('id', editingPoint.id).select().single();
        if (error) throw error;
        savedPoint = data;
        toast.success("Sucesso", { description: "Ponto atualizado com sucesso." });
      } else {
        // MODO ADIÇÃO
        const { data, error } = await supabase.from('points').insert(pointData).select().single();
        if (error) throw error;
        savedPoint = data;
        toast.success("Sucesso", { description: "Ponto criado com sucesso." });
      }

      // Lógica de Tags (Universal)
      const { error: deleteError } = await supabase.from('point_tags').delete().eq('point_id', savedPoint.id);
      if (deleteError) throw deleteError;

      if (tagIds && tagIds.length > 0) {
        const pointTags = tagIds.map(tagId => ({ point_id: savedPoint.id, tag_id: tagId }));
        const { error: insertTagsError } = await supabase.from('point_tags').insert(pointTags);
        if (insertTagsError) throw insertTagsError;
      }

      handleCancelEdit(); // Limpa tudo e volta para a tabela
      fetchPoints();
    } catch (error) {
      console.error('Error saving point:', error);
      toast.error("Erro", { description: `Falha ao salvar o ponto: ${error.message}` });
    }
  };

  // DELETAR (Lógica do Modal)
  const openDeleteDialog = (point) => {
    setPointToDelete(point);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePoint = async () => {
    if (!pointToDelete) return;
    try {
      await supabase.from('point_tags').delete().eq('point_id', pointToDelete.id);
      await supabase.from('points').delete().eq('id', pointToDelete.id);
      toast.success("Sucesso", { description: "Ponto excluído com sucesso." });
      fetchPoints();
    } catch (error) {
      console.error('Error deleting point:', error);
      toast.error("Erro", { description: `Falha ao excluir o ponto: ${error.message}` });
    } finally {
      setIsDeleteDialogOpen(false);
      setPointToDelete(null);
    }
  };

  // BANNER DE INSTRUÇÃO (Dinâmico)
  const getInstruction = () => {
    if (selectionState === SELECTION_STATE.AWAITING_LOCATION) {
      return "1. Clique no mapa para definir a localização e a Rua Principal.";
    }
    if (selectionState === SELECTION_STATE.FORM_OPEN) {
      return `2. Clique na Rua do Cruzamento (Opcional) ou preencha o formulário.`;
    }
    return "Clique no mapa para definir a localização do novo ponto.";
  };
  
  const onMapLoad = useCallback((mapInstance) => setMapInstance(mapInstance), []);
  const onZoomChanged = useCallback(() => { if (mapInstance) setCurrentZoom(mapInstance.getZoom()); }, [mapInstance]);

  // Lógica de Cluster (Dinâmica baseada no zoom)
  const activeRule = useMemo(() => {
    // Fallback padrão
    const defaultRule = { display_mode: currentZoom > 14 ? 'individual' : 'cluster', cluster_radius: 60, min_cluster_size: 2 };
    if (loadingConfig || !rules.length) return defaultRule;
    
    // Usa o fallback do seu código de adição (pega a última regra)
    return rules.find(r => r.zoom_level === currentZoom) || rules[rules.length - 1];
  }, [currentZoom, rules, loadingConfig]);

  const clustererCalculator = (markers, numStyles) => {
    const count = markers.length;
    const index = Math.min(String(count).length, numStyles);
    return { text: String(count), index, title: `${count} pontos` };
  };
  
  // Coordenadas do ponto ativo (novo ou em edição)
  const currentPointCoords = useMemo(() => {
    if (editingPoint && editingPoint.latitude && editingPoint.longitude) {
      return { lat: Number(editingPoint.latitude), lng: Number(editingPoint.longitude) };
    }
    return null;
  }, [editingPoint]);

  // Pontos de contexto (outros pontos, clusters)
  const contextPoints = useMemo(() => {
    // SÓ mostra pontos de contexto (clusters/vermelhos) se estiver em MODO DE ADIÇÃO
    // E ANTES do primeiro clique (enquanto aguarda a localização).
    if (isAddingMode && selectionState === SELECTION_STATE.AWAITING_LOCATION) {
      return points.filter(p => p.latitude && p.longitude);
    }
    
    // Em modo de edição, OU após o primeiro clique de adição, não mostra nenhum.
    return []; 
  }, [points, isAddingMode, selectionState]); // Depende do estado

  // DRAG-N-DROP (Arrastar marcador)
  const handleMarkerDragEnd = useCallback((e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    
    setEditingPoint(prev => ({
      ...prev,
      latitude: newLat,
      longitude: newLng,
    }));
    
    // *** LINHA CORRIGIDA (do build anterior) ***
    toast.info('Coordenadas atualizadas via mapa.');
    
    getAddressDetailsFromCoords(newLat, newLng, ({ streetName }) => {
       setEditingPoint(prev => ({
          ...prev,
          street_name: streetName,
          name: streetName, 
        }));
        toast.success(`Rua principal atualizada para: ${streetName}.`);
    });
    
  }, []); 

  // Define se o layout de formulário/mapa deve ser exibido
  const isFormView = isAddingMode || (editingPoint && selectionState === SELECTION_STATE.FORM_OPEN);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* CABEÇALHO: Título e Botão Adicionar/Cancelar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciar Pontos</h1>
        {isFormView ? (
          <Button variant="destructive" onClick={handleCancelEdit}>
            <XCircle className="mr-2 h-4 w-4" /> Cancelar {editingPoint?.id ? 'Edição' : 'Adição'}
          </Button>
        ) : (
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Ponto
          </Button>
        )}
      </div>

      {/* LAYOUT PRINCIPAL: Tabela ou Grid de Formulário/Mapa */}
      <div className={cn("grid gap-6", isFormView ? "lg:grid-cols-2 h-[70vh]" : "grid-cols-1")}>
        
        {/* COLUNA 1: Formulário (em Adição/Edição) ou Tabela (Padrão) */}
        <div className={cn("flex flex-col", isFormView ? "h-full" : "h-auto")}>
          {isFormView ? (
            <>
              {/* Banner de Instrução */}
              <div className="p-4 text-center bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="font-semibold text-blue-700 flex items-center justify-center">
                  {(selectionState === SELECTION_STATE.FORM_OPEN) && <CornerDownRight className="h-5 w-5 mr-2" />}
                  {getInstruction()}
                </p>
              </div>
              
              {/* O Formulário SÓ APARECE se houver um 'editingPoint'. */}
              {editingPoint && (
                <Card className="flex-grow overflow-y-auto">
                  <CardHeader><CardTitle>{editingPoint.id ? 'Editar Ponto' : 'Novo Ponto'}</CardTitle></CardHeader>
                  <CardContent>
                    <PointForm
                      point={editingPoint}
                      onSave={handleSavePoint}
                      onCancel={handleCancelEdit}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            // MODO TABELA (Padrão)
            loading ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {points.map((point) => (
                    <TableRow key={point.id}>
                      <TableCell title={point.name}>{truncateName(point.name)}</TableCell>
                      <TableCell>{point.status}</TableCell>
                      <TableCell className="text-right flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(point)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(point)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
        </div>

        {/* COLUNA 2: Mapa */}
        <div className={cn(
          "relative w-full rounded-lg overflow-hidden shadow-md",
          isFormView ? "h-full" : "h-[50vh] lg:h-[70vh]"
        )}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={currentPointCoords || defaultCenter}
              zoom={currentPointCoords ? DETAILED_ZOOM_LEVEL : currentZoom} // Zoom 21 se houver ponto, zoom de navegação se não
              onClick={handleMapClick}
              onLoad={onMapLoad}
              onZoomChanged={onZoomChanged}
              options={{ ...mapOptions, draggableCursor: isFormView ? 'crosshair' : 'default' }}
            >
              {/* Marcador do ponto em edição/adição (PINO PADRÃO, arrastável) */}
              {isFormView && currentPointCoords && (
                <Marker 
                  position={currentPointCoords} 
                  draggable={true} 
                  onDragEnd={handleMarkerDragEnd}
                  // Linha do 'icon' removida para usar o pino padrão e corrigir o erro.
                />
              )}
              
              {/* Pontos existentes (Contexto - clusters ou marcadores vermelhos) */}
              {activeRule.display_mode === 'cluster' ? (
                <MarkerClustererF
                  options={{
                    gridSize: activeRule.cluster_radius,
                    minimumClusterSize: activeRule.min_cluster_size, // <-- ERRO CORRIGIDO AQUI (era active.)
                    styles: clusterStyles, // Estilos Amarelos
                  }}
                  calculator={clustererCalculator}
                >
                  {(clusterer) =>
                    contextPoints.map((point) => (
                      <Marker
                        key={point.id}
                        position={{ lat: point.latitude, lng: point.longitude }}
                        clusterer={clusterer}
                        onClick={() => toast.info(`Ponto existente: ${point.name}`)}
                        // Ícone removido para usar o padrão (vermelho)
                      />
                    ))
                  }
                </MarkerClustererF>
              ) : (
                // Renderiza marcadores individuais (Vermelhos)
                contextPoints.map((point) => (
                  <Marker
                    key={point.id}
                    position={{ lat: Number(point.latitude), lng: Number(point.longitude) }} // <-- ERRO CORRIGIDO AQUI (era longitude)
                    onClick={() => toast.info(`Ponto existente: ${point.name}`)}
                    // Ícone removido para usar o padrão (vermelho)
                  />
                ))
              )}
            </GoogleMap>
          ) : <Skeleton className="w-full h-full" />}
        </div>
      </div>

      {/* Modal de Deleção (Mantido) */}
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Você tem certeza?"
        description={`Esta ação não pode ser desfeita. Isso excluirá permanentemente o ponto "${pointToDelete?.name}".`}
      >
        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDeletePoint}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
