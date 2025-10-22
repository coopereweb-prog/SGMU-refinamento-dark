import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, savePoint } from '@/lib/supabase';
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
import { PointMapModal } from '@/components/admin/PointMapModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMapConfig } from '@/contexts/MapConfigContext'; // Importando configurações do mapa

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
  STREET: 1,
  INTERSECTION: 2,
  FORM: 3, // Estado final onde o formulário está aberto
};

// Estilos de cluster (simplificados para o painel admin)
const clusterStyles = [
  { url: 'data:image/svg+xml;charset=UTF-8,<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="23" fill="oklch(0.85 0.2 90)" stroke="oklch(0.145 0 0)" stroke-width="2"/><text x="25" y="30" font-family="sans-serif" font-size="16" fill="oklch(0.145 0 0)" text-anchor="middle" font-weight="bold"></text></svg>', height: 50, width: 50, textColor: 'oklch(0.145 0 0)', textSize: 16, fontWeight: 'bold' },
];

export function ManagePointsPage() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pointToDelete, setPointToDelete] = useState(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newPointCoords, setNewPointCoords] = useState(null);
  const [selectionState, setSelectionState] = useState(SELECTION_STATE.NONE);
  const [currentZoom, setCurrentZoom] = useState(14);
  const [mapInstance, setMapInstance] = useState(null);
  
  // Estados para o modal de visualização
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [pointToView, setPointToView] = useState(null);

  const { isLoaded } = useGoogleMapsLoader();
  const { rules, settings, loading: loadingConfig } = useMapConfig();

  const fetchPoints = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('points').select(`
      id, name, status, latitude, longitude, pricing_tier_id, is_available, image_url, 
      street_name, intersection_name, media_type, description
    `).order('name');
    
    if (error) {
      console.error('Error fetching points:', error);
      toast.error("Erro", { description: "Não foi possível carregar os pontos." });
    } else {
      setPoints(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const handleAddNew = () => {
    setEditingPoint(null);
    setNewPointCoords(null);
    setIsAddingMode(true);
    setSelectionState(SELECTION_STATE.STREET);
    setIsEditModalOpen(false);
  };

  const handleCancelAdd = () => {
    setIsAddingMode(false);
    setNewPointCoords(null);
    setSelectionState(SELECTION_STATE.NONE);
    setEditingPoint(null);
  };

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

  const handleMapClick = (e) => {
    if (!isAddingMode) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    if (selectionState === SELECTION_STATE.STREET) {
      setNewPointCoords({ lat, lng });
      getAddressDetailsFromCoords(lat, lng, ({ streetName, neighborhood }) => {
        const newPoint = { 
          latitude: lat, 
          longitude: lng, 
          street_name: streetName,
          intersection_name: '',
          name: streetName,
          description: '',
          pricing_tier_id: null, // Alteração: Inicializa como null
          is_available: true,
          image_url: '',
          _temp_neighborhood: neighborhood, 
        };
        setEditingPoint(newPoint);
        setSelectionState(SELECTION_STATE.FORM);
        toast.info(`Rua Principal definida: ${streetName}. Agora, clique na rua do cruzamento (opcional) ou preencha o formulário.`);
      });
    } else if (selectionState === SELECTION_STATE.FORM) {
      getAddressDetailsFromCoords(lat, lng, ({ streetName: intersectionName }) => {
        setEditingPoint(prev => ({
          ...prev,
          intersection_name: intersectionName,
        }));
        toast.success(`Rua do Cruzamento sugerida: ${intersectionName}. Ajuste no formulário se necessário.`);
      });
    }
  };

  const handleEdit = (point) => {
    setEditingPoint(point);
    setIsEditModalOpen(true);
    setIsAddingMode(false); 
    setSelectionState(SELECTION_STATE.NONE);
  };

  const handleViewMap = (point) => {
    if (!point.latitude || !point.longitude) {
      toast.warning("Coordenadas ausentes.", { description: "Este ponto não pode ser visualizado no mapa." });
      return;
    }
    setPointToView(point);
    setIsMapModalOpen(true);
  };

  const handleSavePoint = async (pointData, tagIds) => {
    try {
      const dataToSave = {
        ...pointData,
        id: editingPoint?.id || null,
        latitude: pointData.latitude === '' ? null : pointData.latitude,
        longitude: pointData.longitude === '' ? null : pointData.longitude,
        media_type: pointData.media_type || 'static_panel',
      };

      await savePoint(dataToSave, tagIds);

      toast.success("Sucesso", { description: `Ponto ${editingPoint?.id ? 'atualizado' : 'criado'} com sucesso.` });

      setIsEditModalOpen(false);
      setEditingPoint(null);
      setIsAddingMode(false);
      setSelectionState(SELECTION_STATE.NONE);
      fetchPoints();
    } catch (error) {
      console.error('Error saving point:', error);
      toast.error("Erro", { description: `Falha ao salvar o ponto: ${error.message}` });
    }
  };

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

  const getInstruction = () => {
    if (selectionState === SELECTION_STATE.STREET) {
      return "1. Clique no mapa para definir a localização e a Rua Principal.";
    }
    if (selectionState === SELECTION_STATE.FORM) {
      return `2. Clique na Rua do Cruzamento (Opcional) ou preencha o formulário.`;
    }
    return "Clique no mapa para definir a localização do novo ponto.";
  };
  
  const onMapLoad = useCallback((mapInstance) => setMapInstance(mapInstance), []);
  const onZoomChanged = useCallback(() => { if (mapInstance) setCurrentZoom(mapInstance.getZoom()); }, [mapInstance]);

  const activeRule = useMemo(() => {
    if (loadingConfig || !rules.length) return { display_mode: currentZoom > 14 ? 'individual' : 'cluster', cluster_radius: 60, min_cluster_size: 2 };
    return rules.find(r => r.zoom_level === currentZoom) || rules[rules.length - 1];
  }, [currentZoom, rules, loadingConfig]);

  const clustererCalculator = (markers, numStyles) => {
    const count = markers.length;
    const index = Math.min(String(count).length, numStyles);
    return { text: String(count), index, title: `${count} pontos` };
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciar Pontos</h1>
        {!isAddingMode ? (
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Ponto
          </Button>
        ) : (
          <Button variant="destructive" onClick={handleCancelAdd}>
            <XCircle className="mr-2 h-4 w-4" /> Cancelar Adição
          </Button>
        )}
      </div>

      {isAddingMode && (
        <div className="grid lg:grid-cols-2 gap-6 h-[70vh]">
          <div className="flex flex-col gap-4 h-full">
            <div className="p-4 text-center bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-700 flex items-center justify-center">
                {(selectionState === SELECTION_STATE.FORM) && <CornerDownRight className="h-5 w-5 mr-2" />}
                {getInstruction()}
              </p>
            </div>
            <div className="relative flex-grow w-full rounded-lg overflow-hidden shadow-md">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={currentZoom}
                  onClick={handleMapClick}
                  onLoad={onMapLoad}
                  onZoomChanged={onZoomChanged}
                  options={{ ...mapOptions, draggableCursor: 'crosshair' }}
                >
                  {newPointCoords && (
                    <Marker 
                      position={newPointCoords} 
                      icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
                    />
                  )}
                  
                  {activeRule.display_mode === 'cluster' ? (
                    <MarkerClustererF
                      options={{
                        gridSize: activeRule.cluster_radius,
                        minimumClusterSize: activeRule.min_cluster_size,
                        styles: clusterStyles,
                      }}
                      calculator={clustererCalculator}
                    >
                      {(clusterer) =>
                        points.map((point) => (
                          <Marker
                            key={point.id}
                            position={{ lat: point.latitude, lng: point.longitude }}
                            clusterer={clusterer}
                            onClick={() => toast.info(`Ponto existente: ${point.name}`)}
                          />
                        ))
                      }
                    </MarkerClustererF>
                  ) : (
                    points.map((point) => (
                      <Marker
                        key={point.id}
                        position={{ lat: point.latitude, lng: point.longitude }}
                        onClick={() => toast.info(`Ponto existente: ${point.name}`)}
                      />
                    ))
                  )}
                </GoogleMap>
              ) : <Skeleton className="w-full h-full" />}
            </div>
          </div>
          
          {selectionState === SELECTION_STATE.FORM && editingPoint && (
            <Card className="h-full overflow-y-auto">
              <CardHeader><CardTitle>Novo Ponto</CardTitle></CardHeader>
              <CardContent>
                <PointForm
                  point={editingPoint}
                  onSave={handleSavePoint}
                  onCancel={handleCancelAdd}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!isAddingMode && (
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
                  <TableCell>{point.name}</TableCell>
                  <TableCell>{point.status}</TableCell>
                  <TableCell className="text-right flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewMap(point)}
                      disabled={!point.latitude || !point.longitude}
                    >
                      <MapPin className="h-4 w-4 mr-2" /> Ver no Mapa
                    </Button>
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

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingPoint?.id ? 'Editar Ponto' : 'Novo Ponto'}
        description="Preencha os detalhes do ponto abaixo."
      >
        <PointForm
          point={editingPoint}
          onSave={handleSavePoint}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

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
      
      <PointMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        point={pointToView}
      />
    </div>
  );
}