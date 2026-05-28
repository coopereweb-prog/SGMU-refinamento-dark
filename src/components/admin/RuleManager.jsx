import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function RuleManager() {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    zoom_level: 15,
    display_mode: 'individual',
    cluster_radius: 60,
    min_cluster_size: 2,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('rules').select('*').order('zoom_level', { ascending: true });
    if (error) {
      toast.error('Erro ao buscar regras:', error.message);
    } else {
      setRules(data);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRule(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleSelectChange = (name, value) => {
    setNewRule(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (rules.some(rule => rule.zoom_level === newRule.zoom_level)) {
      toast.warning(`Já existe uma regra para o nível de zoom ${newRule.zoom_level}.`);
      return;
    }

    const { data, error } = await supabase.from('rules').insert([newRule]).select();
    if (error) {
      toast.error('Erro ao adicionar regra:', error.message);
    } else {
      toast.success('Regra adicionada com sucesso!');
      setRules(prev => [...prev, ...data].sort((a, b) => a.zoom_level - b.zoom_level));
    }
  };

  const handleDeleteRule = async (id) => {
    const { error } = await supabase.from('rules').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao deletar regra:', error.message);
    } else {
      toast.success('Regra deletada com sucesso!');
      setRules(prev => prev.filter(rule => rule.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Regra de Exibição</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddRule} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              type="number"
              name="zoom_level"
              value={newRule.zoom_level}
              onChange={handleInputChange}
              placeholder="Nível de Zoom"
              required
            />
            <Select name="display_mode" onValueChange={(value) => handleSelectChange('display_mode', value)} value={newRule.display_mode}>
              <SelectTrigger>
                <SelectValue placeholder="Modo de Exibição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="cluster">Cluster</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              name="cluster_radius"
              value={newRule.cluster_radius}
              onChange={handleInputChange}
              placeholder="Raio do Cluster (px)"
              disabled={newRule.display_mode !== 'cluster'}
            />
            <Input
              type="number"
              name="min_cluster_size"
              value={newRule.min_cluster_size}
              onChange={handleInputChange}
              placeholder="Tamanho Mín. Cluster"
              disabled={newRule.display_mode !== 'cluster'}
            />
            <Button type="submit" className="sm:col-span-2 md:col-span-1">Adicionar Regra</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras Atuais</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Carregando regras...</p> : (
            <ul className="space-y-2">
              {rules.map(rule => (
                <li key={rule.id} className="flex justify-between items-center p-2 border rounded">
                  <span>
                    Zoom <strong>{rule.zoom_level}</strong>: {rule.display_mode}
                    {rule.display_mode === 'cluster' && ` (Raio: ${rule.cluster_radius}px, Mín: ${rule.min_cluster_size})`}
                  </span>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteRule(rule.id)}>Deletar</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}