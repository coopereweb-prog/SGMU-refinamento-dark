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
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Função para obter o estado inicial dos filtros
const getInitialFilterState = (key, defaultValue) => {
  try {
    const savedState = localStorage.getItem(key);
    if (savedState) {
      return new Set(JSON.parse(savedState));
    }
  } catch (error) {
    console.error("Failed to parse filters from localStorage", error);
  }
  return new Set(defaultValue);
};

export function FilterPanel({ points, onFilterChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tags, setTags] = useState([]);
  const [allTiers, setAllTiers] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState(() => getInitialFilterState('filterStatuses', ['available']));
  const [selectedTags, setSelectedTags] = useState(() => getInitialFilterState('filterTags', []));
  const [selectedTiers, setSelectedTiers] = useState(() => getInitialFilterState('filterTiers', []));
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [tiersError, setTiersError] = useState(null);

  // Salvar filtros no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem('filterStatuses', JSON.stringify(Array.from(selectedStatuses)));
  }, [selectedStatuses]);

  useEffect(() => {
    localStorage.setItem('filterTags', JSON.stringify(Array.from(selectedTags)));
  }, [selectedTags]);

  useEffect(() => {
    localStorage.setItem('filterTiers', JSON.stringify(Array.from(selectedTiers)));
  }, [selectedTiers]);

  // useMemo para calcular as contagens de status e tiers
  const { statusCounts, tierCounts } = useMemo(() => {
    const statusCounts = { available: 0, reserved: 0, sold: 0 };
    const tierCounts = {};

    points.forEach(p => {
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      }
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
          setTiersError(error.message);
          setAllTiers([]);
        } else {
          const sortedTiers = tiersData.sort((a, b) => {
            const order = ['Ouro', 'Prata', 'Bronze'];
            return order.indexOf(a.name) - order.indexOf(b.name);
          });
          setAllTiers(sortedTiers);
        }
      } catch (err) {
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
    <>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-2 pb-2 space-y-2">
            <h4 className="font-semibold text-sm">Status</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between w-[260px]">
                <div className="flex items-center space-x-2"><Checkbox id="status-available" checked={selectedStatuses.has('available')} onCheckedChange={() => handleStatusChange('available')} /><Label htmlFor="status-available" className="cursor-pointer">Disponíveis</Label></div>
                <Badge className="bg-status-available text-primary-foreground hover:bg-status-available/90">{statusCounts.available}</Badge>
              </div>
              <div className="flex items-center justify-between w-[260px]">
                <div className="flex items-center space-x-2"><Checkbox id="status-reserved" checked={selectedStatuses.has('reserved')} onCheckedChange={() => handleStatusChange('reserved')} /><Label htmlFor="status-reserved" className="cursor-pointer">Reservados</Label></div>
                <Badge className="bg-status-reserved text-primary-foreground hover:bg-status-reserved/90">{statusCounts.reserved}</Badge>
              </div>
              <div className="flex items-center justify-between w-[260px]">
                <div className="flex items-center space-x-2"><Checkbox id="status-sold" checked={selectedStatuses.has('sold')} onCheckedChange={() => handleStatusChange('sold')} /><Label htmlFor="status-sold" className="cursor-pointer">Contratados</Label></div>
                <Badge variant="destructive">{statusCounts.sold}</Badge>
              </div>
            </div>

            <Separator />

            {!isExpanded && (
              <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setIsExpanded(true)}>
                Ver mais filtros <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            )}

            {isExpanded && (
              <div className="space-y-2 animate-in fade-in-0 duration-300">
                <div>
                  <h4 className="font-semibold text-sm">Classificação</h4>
                  <div className="space-y-1 mt-1">
                    {loadingTiers ? (
                      Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
                    ) : tiersError ? (
                      <p className="text-sm text-red-500">Erro ao carregar: {tiersError}</p>
                    ) : allTiers.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhuma classificação.</p>
                    ) : (
                      allTiers.map(tier => (
                        <div key={tier.id} className="flex items-center justify-between w-[260px]">
                          <div className="flex items-center space-x-2"><Checkbox id={`tier-${tier.id}`} checked={selectedTiers.has(tier.id)} onCheckedChange={() => handleTierChange(tier.id)} /><Label htmlFor={`tier-${tier.id}`} className="cursor-pointer">{tier.name}</Label></div>
                          <Badge variant="secondary">{tierCounts[tier.id] || 0}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm">Características</h4>
                  <div className="space-y-1 mt-1">
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

                <Separator />
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setIsExpanded(false)}>
                  Mostrar menos <ChevronUp className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <div className="px-2 pt-1 border-t">
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Limpar Filtros
        </Button>
      </div>
    </>
  );
}