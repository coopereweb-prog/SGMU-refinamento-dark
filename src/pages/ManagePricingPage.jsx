export default function ManagePricingPage() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);

  const fetchTiers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('pricing_tiers').select('*').order('name');
    if (error) {
      toast.error("Erro ao carregar níveis de preço.", { description: error.message });
    } else {
      setTiers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleAddNew = () => {
    setEditingTier(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tier) => {
    setEditingTier(tier);
    setIsFormOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingTier) {
        const { error } = await supabase.from('pricing_tiers').update(formData).eq('id', editingTier.id);
        if (error) throw error;
        toast.success("Nível de preço atualizado com sucesso.");
      } else {
        const { error } = await supabase.from('pricing_tiers').insert(formData);
        if (error) throw error;
        toast.success("Nível de preço criado com sucesso.");
      }
      setIsFormOpen(false);
      fetchTiers();
    } catch (error) {
      toast.error("Falha ao salvar o nível de preço.", { description: error.message });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciar Níveis de Preço</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Nível
        </Button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço (1 Ano)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.map((tier) => (
              <TableRow key={tier.id}>
                <TableCell className="font-medium">{tier.name}</TableCell>
                <TableCell>{Number(tier.price_1y).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(tier)}>
                    <Edit className="h-4 w-4" />
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
        title={editingTier ? 'Editar Nível de Preço' : 'Novo Nível de Preço'}
      >
        <PricingTierForm
          tier={editingTier}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
}