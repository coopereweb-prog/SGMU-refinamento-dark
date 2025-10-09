export default function ManageTagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tags').select('*').order('name');
    if (error) {
      console.error('Error fetching tags:', error);
      toast.error("Erro", { description: "Não foi possível carregar as tags." });
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
        toast.success("Sucesso", { description: "Tag atualizada com sucesso." });
      } else {
        const { error } = await supabase.from('tags').insert(tagData);
        if (error) throw error;
        toast.success("Sucesso", { description: "Tag criada com sucesso." });
      }
      setIsFormOpen(false);
      setEditingTag(null);
      fetchTags();
    } catch (error) {
      console.error('Error saving tag:', error);
      toast.error("Erro", { description: `Falha ao salvar a tag: ${error.message}` });
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
      toast.success("Sucesso", { description: "Tag excluída com sucesso." });
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error("Erro", { description: `Falha ao excluir a tag: ${error.message}` });
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

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTag ? 'Editar Tag' : 'Nova Tag'}
        description="Insira o nome para a tag."
      >
        <TagForm
          tag={editingTag}
          onSave={handleSaveTag}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Você tem certeza?"
        description={`Esta ação não pode ser desfeita. Isso excluirá permanentemente a tag "${tagToDelete?.name}".`}
      >
        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDeleteTag}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}