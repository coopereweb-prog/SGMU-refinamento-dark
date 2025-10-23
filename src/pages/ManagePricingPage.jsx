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
import { Modal } from '@/components/Modal';
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { PricingTierForm } from '@/components/PricingTierForm';

export function ManagePricingPage() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [editingTierPrices, setEditingTierPrices] = useState([]);

  const fetchTiers = async () => {
    setLoading(true);
    // Busca os tiers e seus preços associados
    const { data, error } = await supabase
      .from('pricing_tiers')
      .select(`
        *,
        tier_prices (id, period_days, price)
      `)
      .order('name');
      
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
    setEditingTierPrices([]);
    setIsFormOpen(true);
  };

  const handleEdit = (tier) => {
    setEditingTier(tier);
    setEditingTierPrices(tier.tier_prices || []);
    setIsFormOpen(true);
  };

  const handleSave = async (tierData, pricesToSave) => {
    try {
      let savedTier;
      
      // 1. Salva/Atualiza o Tier Principal
      if (editingTier) {
        const { data, error } = await supabase
          .from('pricing_tiers')
          .update(tierData)
          .eq('id', editingTier.id)
          .select()
          .single();
        if (error) throw error;
        savedTier = data;
      } else {
        const { data, error } = await supabase
          .from('pricing_tiers')
          .insert(tierData)
          .select()
          .single();
        if (error) throw error;
        savedTier = data;
      }

      // 2. Salva/Atualiza os Preços (Tier Prices)
      const pricesWithTierId = pricesToSave.map(p => ({
        ...p,
        tier_id: savedTier.id,
        // Usamos period_days como chave para o upsert, já que é único por tier
        id: editingTierPrices.find(ep => ep.period_days === p.period_days)?.id,
      }));
      
      const { error: pricesError } = await supabase
        .from('tier_prices')
        .upsert(pricesWithTierId, { onConflict: 'tier_id, period_days' });
        
      if (pricesError) throw pricesError;

      toast.success(`Nível de preço ${editingTier ? 'atualizado' : 'criado'} com sucesso.`);
      setIsFormOpen(false);
      fetchTiers();
    } catch (error) {
      toast.error("Falha ao salvar o nível de preço.", { description: error.message });
    }
  };
  
  const getPriceForPeriod = (tier, periodYears) => {
    const periodDays = periodYears * 365;
    const priceItem = tier.tier_prices?.find(p => p.period_days === periodDays);
    return priceItem ? Number(priceItem.price) : 0;
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
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
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
                <TableCell>{getPriceForPeriod(tier, 1).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(tier)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {/* Implementar exclusão se necessário */}
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
          tierPrices={editingTierPrices}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
}