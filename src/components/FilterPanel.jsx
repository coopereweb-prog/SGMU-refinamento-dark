import { useState, useEffect, useMemo } from 'react';
import { getTags } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function FilterPanel({ points, onFilterChange }) {
  const [tags, setTags] = useState([]);
  const [allTiers, setAllTiers] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [selectedTiers, setSelectedTiers] = useState(new Set());
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [tiersError, setTiersError] = useState(null);

  // useMemo para calcular as contagens de status e tiers
  const { statusCounts, tierCounts } = useMemo(() => {
    const statusCounts = { available: 0, reserved: 0, sold: 0 };
    const tierCounts = {};

    points.forEach(p => {
      // Contagem de status
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      }

      // Contagem de tiers
      if (p.pricing_tiers) {
        const tierId = p.pricing_tiers.id;
        tierCounts[tierId] = (tierCounts[tierId] || 0) + 1;
      }
    });

    return { statusCounts, tierCounts };
  }, [points]);

  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      const tagsData = await getTags();
      setTags(tagsData);
      setLoadingTags(false);
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchTiers = async () => {
      setLoadingTiers(true);
      setTiersError(null);
      try {
        const { data: tiersData, error } = await supabase.from('pricing_tiers').select('*').order('name');
        if (error) {
          console.error('Erro ao buscar tiers:', error);
          setTiersError(error.message);
          setAllTiers([]);
        } else {
          console.log('Tiers carregados:', tiersData);
          setAllTiers(tiersData || []);
        }
      } catch (err) {
        console.error('Erro inesperado ao buscar tiers:', err);
        setTiersError('Erro inesperado ao carregar classificações.');
        setAllTiers([]);
      } finally {
        setLoadingTiers(false);
      }
    };
    fetchTiers();
  }, []);

  useEffect(() => {
    onFilterChange({
      statuses: Array.from(selectedStatuses),
      tags: Array.from(selectedTags),
      tiers: Array.from(selectedTiers),
    });
  }, [selectedStatuses, selectedTags, selectedTiers, onFilterChange]);

  const handleStatusChange = (status) => {
    const newStatuses = new Set(selectedStatuses);
    newStatuses.has(status) ? newStatuses.delete(status) : newStatuses.add(status);
    setSelectedStatuses(newStatuses);
  };

  const handleTagChange = (tagId) => {
    const newTags = new Set(selectedTags);
    newTags.has(tagId) ? newTags.delete(tagId) : newTags.add(tagId);
    setSelectedTags(newTags);
  };

  const handleTierChange = (tierId) => {
    const newTiers = new Set(selectedTiers);
    newTiers.has(tierId) ? newTiers.delete(tierId) : newTiers.add(tierId);
    setSelectedTiers(newTiers);
  };

  const clearFilters = () => {
    setSelectedStatuses(new Set());
    setSelectedTags(new Set());
    setSelectedTiers(new Set());
  };

  return (
    <div className="flex flex-col h-full">
      <CardContent className="flex-grow overflow-y-auto p-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Status</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2"><Checkbox id="status-available" checked={selectedStatuses.has('available')} onCheckedChange={() => handleStatusChange('available')} /><Label htmlFor="status-available" className="cursor-pointer">Disponíveis</Label></div>
              <Badge className="bg-status-available text-primary-foreground hover:bg-status-available/90">{statusCounts.available}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2"><Checkbox id="status-reserved" checked={selectedStatuses.has('reserved')} onCheckedChange={() => handleStatusChange('reserved')} /><Label htmlFor="status-reserved" className="cursor-pointer">Reservados</Label></div>
              <Badge className="bg-status-reserved text-primary-foreground hover:bg-status-reserved/90">{statusCounts.reserved}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2"><Checkbox id="status-sold" checked={selectedStatuses.has('sold')} onCheckedChange={() => handleStatusChange('sold')} /><Label htmlFor="status-sold" className="cursor-pointer">Contratados</Label></div>
              <Badge variant="destructive">{statusCounts.sold}</Badge>
            </div>
          </div>

          <Separator className="my-4" />

          <h4 className="font-semibold text-sm">Classificação</h4>
          <div className="space-y-3">
            {loadingTiers ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
            ) : tiersError ? (
              <p className="text-sm text-red-500">Erro ao carregar classificações: {tiersError}</p>
            ) : allTiers.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma classificação disponível.</p>
            ) : (
              allTiers.map(tier => (
                <div key={tier.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2"><Checkbox id={`tier-${tier.id}`} checked={selectedTiers.has(tier.id)} onCheckedChange={() => handleTierChange(tier.id)} /><Label htmlFor={`tier-${tier.id}`} className="cursor-pointer">{tier.name}</Label></div>
                  <Badge variant="secondary">{tierCounts[tier.id] || 0}</Badge>
                </div>
              ))
            )}
          </div>

          <Separator className="my-4" />

          <h4 className="font-semibold text-sm">Características</h4>
          <div className="space-y-3">
            {loadingTags ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
            ) : (
              tags.map(tag => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox id={`tag-${tag.id}`} checked={selectedTags.has(tag.id)} onCheckedChange={() => handleTagChange(tag.id)} />
                  <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer">{tag.name}</Label>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      <div className="p-6 pt-4 mt-auto border-t">
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
}