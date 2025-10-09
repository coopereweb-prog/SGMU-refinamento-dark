import { useState, useEffect, useMemo } from 'react';
import { getTags } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function FilterPanel({ points, onFilterChange }) {
  const [tags, setTags] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [selectedTiers, setSelectedTiers] = useState(new Set());
  const [loadingTags, setLoadingTags] = useState(true);

  const { statusCounts, availableTiers, tierCounts } = useMemo(() => {
    const statusCounts = { available: 0, reserved: 0, sold: 0 };
    const tiersMap = new Map();
    const tierCounts = {};

    points.forEach(p => {
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      }
      if (p.pricing_tiers) {
        if (!tiersMap.has(p.pricing_tiers.id)) {
          tiersMap.set(p.pricing_tiers.id, p.pricing_tiers.name);
        }
        tierCounts[p.pricing_tiers.id] = (tierCounts[p.pricing_tiers.id] || 0) + 1;
      }
    });

    const availableTiers = Array.from(tiersMap, ([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { statusCounts, availableTiers, tierCounts };
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
    <Card className="bg-card/80 backdrop-blur-sm w-full h-full flex flex-col border-none shadow-none">
      <CardHeader>
        <CardTitle>Filtrar Pontos</CardTitle>
        <CardDescription>Selecione um ou mais filtros para refinar a busca no mapa.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-y-auto">
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
            {availableTiers.map(tier => (
              <div key={tier.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2"><Checkbox id={`tier-${tier.id}`} checked={selectedTiers.has(tier.id)} onCheckedChange={() => handleTierChange(tier.id)} /><Label htmlFor={`tier-${tier.id}`} className="cursor-pointer">{tier.name}</Label></div>
                <Badge variant="secondary">{tierCounts[tier.id] || 0}</Badge>
              </div>
            ))}
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
    </Card>
  );
}