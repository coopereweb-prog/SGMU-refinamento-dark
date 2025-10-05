import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
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
import { PlusCircle, Edit, Trash2, MapPin, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

const center = {
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

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script-admin',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

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
    setIsAddingMode(true);
    toast.info("Clique no mapa", { description: "Selecione a localização para o novo ponto." });
  };

  const handleMapClick = (e) => {
    if (!isAddingMode) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    setEditingPoint({ latitude: lat, longitude: lng });
    setIsFormOpen(true);
    setIsAddingMode(false);
  };

  const handleEdit = (point) => {
    setEditingPoint(point);
    setIsFormOpen(true);
  };

  const handleSavePoint = async (pointData, tagIds) => {
    try {
      let savedPoint;
      if (editingPoint && editingPoint.id) {
        // Update point
        const { data, error } = await supabase
          .from('points')
          .update(pointData)
          .eq('id', editingPoint.id)
          .select()
          .single();
        if (error) throw error;
        savedPoint = data;
        toast.success("Sucesso", { description: "Ponto atualizado com sucesso." });
      } else {
        // Create new point
        const { data, error } = await supabase
          .from('points')
          .insert(pointData)
          .select()
          .single();
        if (error) throw error;
        savedPoint = data;
        toast.success("Sucesso", { description: "Ponto criado com sucesso." });
      }

      // Handle tags
      const { error: deleteError } = await supabase.from('point_tags').delete().eq('point_id', savedPoint.id);
      if (deleteError) throw deleteError;

      if (tagIds && tagIds.length > 0) {
        const pointTags = tagIds.map(tagId => ({ point_id: savedPoint.id, tag_id: tagId }));
        const { error: insertTagsError } = await supabase.from('point_tags').insert(pointTags);
        if (insertTagsError) throw insertTagsError;
      }

      setIsFormOpen(false);
      setEditingPoint(null);
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
      const { error: tagsError } = await supabase.from('point_tags').delete().eq('point_id', pointToDelete.id);
      if (tagsError) throw tagsError;

      const { error: pointError } = await supabase.from('points').delete().eq('id', pointToDelete.id);
      if (pointError) throw pointError;

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
          <Button variant="destructive" onClick={() => setIsAddingMode(false)}>
            <XCircle className="mr-2 h-4 w-4" /> Cancelar Adição
          </Button>
        )}
      </div>

      {isAddingMode && (
        <div className="p-4 text-center bg-blue-50 border border-blue-200 rounded-lg">
          <p className="font-semibold text-blue-700">Clique no mapa para definir a localização do novo ponto.</p>
        </div>
      )}

      <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-md">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={14}
            onClick={handleMapClick}
            options={{ draggableCursor: isAddingMode ? 'crosshair' : 'grab' }}
          >
            {points.map(point => (
              <Marker key={point.id} position={{ lat: point.latitude, lng: point.longitude }} />
            ))}
          </GoogleMap>
        ) : <Skeleton className="w-full h-full" />}
      </div>

      {loading ? (
        <p>Carregando tabela de pontos...</p>
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
                <TableCell className="text-right">
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
    </div>
  );
}