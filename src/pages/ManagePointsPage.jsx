import { useState, useEffect, useCallback } from 'react';
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
import { GoogleMap, Marker } from '@react-google-maps/api';
import { PointMapModal } from '@/components/admin/PointMapModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: -22.78,
  lng: -47.30
};

// Estados de seleção de rua
const SELECTION_STATE = {
  NONE: 0,
  STREET: 1,
  INTERSECTION: 2,
  FORM: 3, // Novo estado para indicar que o formulário está aberto ao lado do mapa
};

export function ManagePointsPage() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Usado apenas para EDIÇÃO
  const [editingPoint, setEditingPoint] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pointToDelete, setPointToDelete] = useState(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newPointCoords, setNewPointCoords] = useState(null);
  const [selectionState, setSelectionState] = useState(SELECTION_STATE.NONE);
  
  // Estados para o modal de visualização
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [pointToView, setPointToView] = useState(null);

  const { isLoaded } = useGoogleMapsLoader();

  const fetchPoints = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('points').select('*').order('name');
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
    setSelectionState(SELECTION_STATE.STREET); // Começa selecionando a rua principal
    setIsEditModalOpen(false); // Garante que o modal de edição esteja fechado
  };

  const handleCancelAdd = () => {
    setIsAddingMode(false);
    setNewPointCoords(null);
    setSelectionState(SELECTION_STATE.NONE);
    setEditingPoint(null);
  };

  const getStreetNameFromCoords = (lat, lng, callback) => {
    if (!isLoaded) {
      toast.warning("Serviço de mapas não carregado. Tente novamente.");
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        const routeComponent = results[0].address_components.find(c => c.types.includes('route'));
        const streetName = routeComponent ? routeComponent.long_name : results[0].formatted_address;
        callback(streetName);
      } else {
        toast.warning("Não foi possível encontrar o nome da rua. Por favor, insira manualmente.");
        callback('');
      }
    });
  };

  const handleMapClick = (e) => {
    if (!isAddingMode) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    if (selectionState === SELECTION_STATE.STREET) {
      setNewPointCoords({ lat, lng });
      getStreetNameFromCoords(lat, lng, (streetName) => {
        setEditingPoint({ 
          latitude: lat, 
          longitude: lng, 
          street_name: streetName,
          intersection_name: '',
          name: streetName, // Nome inicial
          description: '',
          pricing_tier_id: '',
          is_available: true,
          image_url: '',
        });
        setSelectionState(SELECTION_STATE.INTERSECTION);
        toast.info(`Rua Principal definida: ${streetName}. Agora clique na rua do cruzamento (opcional).`);
      });
    } else if (selectionState === SELECTION_STATE.INTERSECTION) {
      getStreetNameFromCoords(lat, lng, (intersectionName) => {
        setEditingPoint(prev => ({
          ...prev,
          intersection_name: intersectionName,
          name: `${prev.street_name} c/ ${intersectionName}`,
        }));
        setSelectionState(SELECTION_STATE.FORM); // Passa para o estado de formulário
        toast.success(`Cruzamento definido: ${editingPoint.street_name} c/ ${intersectionName}. Abra o formulário.`);
      });
    }
  };

  const handleEdit = (point) => {
    setEditingPoint(point);
    setIsEditModalOpen(true); // Usa o modal para edição
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
      let savedPoint;
      if (editingPoint && editingPoint.id) {
        const { data, error } = await supabase.from('points').update(pointData).eq('id', editingPoint.id).select().single();
        if (error) throw error;
        savedPoint = data;
        toast.success("Sucesso", { description: "Ponto atualizado com sucesso." });
      } else {
        const { data, error } = await supabase.from('points').insert(pointData).select().single();
        if (error) throw error;
        savedPoint = data;
        toast.success("Sucesso", { description: "Ponto criado com sucesso." });
      }

      const { error: deleteError } = await supabase.from('point_tags').delete().eq('point_id', savedPoint.id);
      if (deleteError) throw deleteError;

      if (tagIds && tagIds.length > 0) {
        const pointTags = tagIds.map(tagId => ({ point_id: savedPoint.id, tag_id: tagId }));
        const { error: insertTagsError } = await supabase.from('point_tags').insert(pointTags);
        if (insertTagsError) throw insertTagsError;
      }

      setIsEditModalOpen(false); // Fecha o modal de edição
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
    if (selectionState === SELECTION_STATE.INTERSECTION) {
      return `2. Clique na Rua do Cruzamento (Opcional). Rua Principal: ${editingPoint?.street_name || 'N/A'}`;
    }
    if (selectionState === SELECTION_STATE.FORM) {
      return `3. Preencha os detalhes do ponto: ${editingPoint?.name || 'Novo Ponto'}`;
    }
    return "Clique no mapa para definir a localização do novo ponto.";
  };
  
  const handleSkipIntersection = () => {
    if (selectionState === SELECTION_STATE.INTERSECTION) {
      setSelectionState(SELECTION_STATE.FORM);
      toast.info("Seleção de cruzamento ignorada. Preencha o formulário.");
    }
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
          {/* Coluna do Mapa */}
          <div className="flex flex-col gap-4 h-full">
            <div className="p-4 text-center bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-700 flex items-center justify-center">
                {(selectionState === SELECTION_STATE.INTERSECTION || selectionState === SELECTION_STATE.FORM) && <CornerDownRight className="h-5 w-5 mr-2" />}
                {getInstruction()}
              </p>
              {selectionState === SELECTION_STATE.INTERSECTION && (
                <Button variant="link" onClick={handleSkipIntersection} className="mt-2 p-0 h-auto text-sm">
                  Pular seleção de cruzamento e abrir formulário
                </Button>
              )}
            </div>
            <div className="relative flex-grow w-full rounded-lg overflow-hidden shadow-md">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={14}
                  onClick={handleMapClick}
                  options={{ draggableCursor: 'crosshair' }}
                >
                  {newPointCoords && (
                    <Marker 
                      position={newPointCoords} 
                      icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
                    />
                  )}
                </GoogleMap>
              ) : <Skeleton className="w-full h-full" />}
            </div>
          </div>
          
          {/* Coluna do Formulário (Apenas no estado FORM) */}
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

      {/* Modal de Edição (Mantido para edição de pontos existentes) */}
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