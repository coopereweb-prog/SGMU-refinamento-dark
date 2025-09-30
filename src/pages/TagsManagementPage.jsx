import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, deleteTag } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TagForm } from '../components/TagForm';
import { Home, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

function TagsManagementPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  const fetchTags = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tags').select('*').order('name');
    if (error) {
      console.error('Error fetching tags:', error);
      toast.error('Não foi possível carregar as tags.');
    } else {
      setTags(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingTag(null);
    fetchTags();
    toast.success(`Tag ${editingTag ? 'atualizada' : 'criada'} com sucesso!`);
  };

  const handleAddNew = () => {
    setEditingTag(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setIsDialogOpen(true);
  };

  const handleDelete = async (tagId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tag? Ela será removida de todos os pontos associados.')) return;
    try {
      await deleteTag(tagId);
      toast.success('Tag excluída com sucesso.');
      fetchTags();
    } catch (error) {
      toast.error(`Erro ao excluir tag: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Tags</h1>
          <p className="text-gray-600">Adicione, edite ou remova tags de características dos pontos.</p>
        </div>
        <Link to="/admin">
          <Button variant="outline"><Home className="h-4 w-4 mr-2" /> Voltar para Pedidos</Button>
        </Link>
      </header>

      <main>
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Tags Cadastradas</span>
              <Button onClick={handleAddNew}><PlusCircle className="h-4 w-4 mr-2" /> Adicionar Nova Tag</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Carregando...</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map(tag => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">{tag.name}</TableCell>
                      <TableCell>{new Date(tag.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTag ? 'Editar Tag' : 'Adicionar Nova Tag'}</DialogTitle>
          </DialogHeader>
          <TagForm tag={editingTag} onSave={handleSave} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TagsManagementPage;