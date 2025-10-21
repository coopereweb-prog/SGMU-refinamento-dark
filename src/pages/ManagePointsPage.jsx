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
import { PlusCircle, Edit, Trash2, XCircle, MapPin, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGoogleMapsLoader } from '@/contexts/GoogleMapsLoaderContext';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { PointMapModal } from '@/components/admin/PointMapModal';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: -22.78,
  lng: -47.30
};

export function ManagePointsPage() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pointToDelete, setPointToDelete] = useState(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newPointCoords, setNewPointCoords] = useState(null);
  
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
  };

  const handleCancelAdd = () => {
    setIsAddingMode(false);
    setNewPointCoords(null);
  };

  const handleMapClick = (e) => {
    if (!isAddingMode) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setNewPointCoords({ lat, lng });

    if (!isLoaded) {
      toast.warning("Serviço de mapas não carregado. Tente novamente.");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        let pointName = results[0].formatted_address; // Padrão: o endereço mais relevante

        // 1. Tenta encontrar um resultado que seja explicitamente um cruzamento (intersection)
        const intersectionResult = results.find(r => r.types.includes('intersection'));
        
        if (intersectionResult) {
          // Se encontrar um cruzamento, prioriza o nome formatado dele
          pointName = intersectionResult.formatted_address;
        } else {
          // 2. Se não for um cruzamento, tenta construir o nome a partir da rua e número
          const address = results[0].address_components;
          const street = address.find(c => c.types.includes('route'))?.long_name;
          const number = address.find(c => c.types.includes('street_number'))?.long_name;
          
          // Se tiver rua, usa a combinação (rua, número) ou apenas a rua.
          if (street) {
             pointName = number ? `${street}, ${number}` : street;
          }
        }
        
        setEditingPoint({ latitude: lat, longitude: lng, name: pointName || '' });
        setIsFormOpen(true);
      } else {
        toast.warning("Não foi possível encontrar o nome da rua.", { description: "Por favor, insira manualmente." });
        setEditingPoint({ latitude: lat, longitude: lng, name: '' });
        setIsFormOpen(true);
      }
    });
  };

  const handleEdit = (point) => {
    setEditingPoint(point);
    setIsFormOpen(true);
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

      setIsFormOpen(false);
      setEditingPoint(null);
      setIsAddingMode(false); // Sai do modo de adição após salvar
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
        <div className="h-[60vh] flex flex-col gap-4">
          <div className="p-4 text-center bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold text-blue-700">Clique no mapa para definir a localização do novo ponto.</p>
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
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingPoint?.id ? 'Editar Ponto' : 'Novo Ponto'}
        description="Preencha os detalhes do ponto abaixo."
      >
        <PointForm
          point={editingPoint}
          onSave={handleSavePoint}
          onCancel={() => setIsFormOpen(false)}
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