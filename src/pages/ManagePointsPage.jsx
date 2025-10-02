import { useState, useEffect } from 'react';
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
import { BaseModal } from '@/components/BaseModal';
import { BaseAlertDialog } from '@/components/BaseAlertDialog';
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export function ManagePointsPage() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pointToDelete, setPointToDelete] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('points').select('*').order('name');
    if (error) {
      console.error('Error fetching points:', error);
      toast({ title: "Erro", description: "Não foi possível carregar os pontos.", variant: "destructive" });
    } else {
      setPoints(data);
    }
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingPoint(null);
    setIsFormOpen(true);
  };

  const handleEdit = (point) => {
    setEditingPoint(point);
    setIsFormOpen(true);
  };

  const handleSavePoint = async (pointData, tagIds) => {
    try {
      let savedPoint;
      if (editingPoint) {
        // Update point
        const { data, error } = await supabase
          .from('points')
          .update(pointData)
          .eq('id', editingPoint.id)
          .select()
          .single();
        if (error) throw error;
        savedPoint = data;
        toast({ title: "Sucesso", description: "Ponto atualizado com sucesso." });
      } else {
        // Create new point
        const { data, error } = await supabase
          .from('points')
          .insert(pointData)
          .select()
          .single();
        if (error) throw error;
        savedPoint = data;
        toast({ title: "Sucesso", description: "Ponto criado com sucesso." });
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
      toast({ title: "Erro", description: `Falha ao salvar o ponto: ${error.message}`, variant: "destructive" });
    }
  };

  const openDeleteDialog = (point) => {
    setPointToDelete(point);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePoint = async () => {
    if (!pointToDelete) return;
    try {
      // First, delete associations in point_tags
      const { error: tagsError } = await supabase.from('point_tags').delete().eq('point_id', pointToDelete.id);
      if (tagsError) throw tagsError;

      // Then, delete the point
      const { error: pointError } = await supabase.from('points').delete().eq('id', pointToDelete.id);
      if (pointError) throw pointError;

      toast({ title: "Sucesso", description: "Ponto excluído com sucesso." });
      fetchPoints();
    } catch (error) {
      console.error('Error deleting point:', error);
      toast({ title: "Erro", description: `Falha ao excluir o ponto: ${error.message}`, variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setPointToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciar Pontos</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Ponto
        </Button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Disponível</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {points.map((point) => (
              <TableRow key={point.id}>
                <TableCell>{point.name}</TableCell>
                <TableCell>{point.is_available ? 'Sim' : 'Não'}</TableCell>
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

      <BaseModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingPoint ? 'Editar Ponto' : 'Novo Ponto'}
      >
        <PointForm
          point={editingPoint}
          onSave={handleSavePoint}
          onCancel={() => setIsFormOpen(false)}
        />
      </BaseModal>

      <BaseAlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeletePoint}
        title="Você tem certeza?"
        description={`Esta ação não pode ser desfeita. Isso excluirá permanentemente o ponto "${pointToDelete?.name}".`}
        confirmText="Excluir"
      />
    </div>
  );
}