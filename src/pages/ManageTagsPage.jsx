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
import { TagForm } from '@/components/TagForm';
import { BaseModal } from '@/components/BaseModal';
import { BaseAlertDialog } from '@/components/BaseAlertDialog';
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export function ManageTagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tags').select('*').order('name');
    if (error) {
      console.error('Error fetching tags:', error);
      toast({ title: "Erro", description: "Não foi possível carregar as tags.", variant: "destructive" });
    } else {
      setTags(data);
    }
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingTag(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setIsFormOpen(true);
  };

  const handleSaveTag = async (tagData) => {
    try {
      if (editingTag) {
        const { error } = await supabase.from('tags').update(tagData).eq('id', editingTag.id);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Tag atualizada com sucesso." });
      } else {
        const { error } = await supabase.from('tags').insert(tagData);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Tag criada com sucesso." });
      }
      setIsFormOpen(false);
      setEditingTag(null);
      fetchTags();
    } catch (error) {
      console.error('Error saving tag:', error);
      toast({ title: "Erro", description: `Falha ao salvar a tag: ${error.message}`, variant: "destructive" });
    }
  };

  const openDeleteDialog = (tag) => {
    setTagToDelete(tag);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    try {
      const { error } = await supabase.from('tags').delete().eq('id', tagToDelete.id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Tag excluída com sucesso." });
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({ title: "Erro", description: `Falha ao excluir a tag: ${error.message}`, variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setTagToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciar Tags</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Tag
        </Button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>{tag.name}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(tag)}>
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
        title={editingTag ? 'Editar Tag' : 'Nova Tag'}
      >
        <TagForm
          tag={editingTag}
          onSave={handleSaveTag}
          onCancel={() => setIsFormOpen(false)}
        />
      </BaseModal>

      <BaseAlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteTag}
        title="Você tem certeza?"
        description={`Esta ação não pode ser desfeita. Isso excluirá permanentemente a tag "${tagToDelete?.name}".`}
        confirmText="Excluir"
      />
    </div>
  );
}