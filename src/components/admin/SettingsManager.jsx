import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function SettingsManager() {
  const [settings, setSettings] = useState({ id: 1, cluster_count_logic: 'total' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') { // Ignore 'single row not found'
      toast.error('Erro ao buscar configurações:', error.message);
    } else if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleSettingChange = (value) => {
    setSettings(prev => ({ ...prev, cluster_count_logic: value }));
  };

  const handleSaveChanges = async () => {
    const { error } = await supabase.from('settings').upsert(settings);
    if (error) {
      toast.error('Erro ao salvar configurações:', error.message);
    } else {
      toast.success('Configurações salvas com sucesso!');
    }
  };

  if (loading) {
    return <p>Carregando configurações...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="cluster-logic">Lógica de Contagem no Cluster</label>
          <Select onValueChange={handleSettingChange} value={settings.cluster_count_logic}>
            <SelectTrigger id="cluster-logic" className="w-[250px]">
              <SelectValue placeholder="Selecionar lógica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Contar todos os pontos</SelectItem>
              <SelectItem value="available_only">Contar apenas pontos disponíveis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
      </CardContent>
    </Card>
  );
}