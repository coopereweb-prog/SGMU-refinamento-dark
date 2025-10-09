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
  const [loadingTags, setLoadingTags] = useState(true);

  const statusCounts = useMemo(() => {
    return {
      available: points.filter(p => p.status === 'available').length,
      reserved: points.filter(p => p.status === 'reserved').length,
      sold: points.filter(p => p.status === 'sold').length,
    };
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
    });
  }, [selectedStatuses, selectedTags, onFilterChange]);

  const handleStatusChange = (status) => {
    const newStatuses = new Set(selectedStatuses);
    if (newStatuses.has(status)) {
      newStatuses.delete(status);
    } else {
      newStatuses.add(status);
    }
    setSelectedStatuses(newStatuses);
  };

  const handleTagChange = (tagId) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tagId)) {
      newTags.delete(tagId);
    } else {
      newTags.add(tagId);
    }
    setSelectedTags(newTags);
  };

  const clearFilters = () => {
    setSelectedStatuses(new Set());
    setSelectedTags(new Set());
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
              <div className="flex items-center space-x-2">
                <Checkbox id="status-available" checked={selectedStatuses.has('available')} onCheckedChange={() => handleStatusChange('available')} />
                <Label htmlFor="status-available" className="cursor-pointer">Disponíveis</Label>
              </div>
              <Badge className="bg-status-available text-primary-foreground hover:bg-status-available/90">{statusCounts.available}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="status-reserved" checked={selectedStatuses.has('reserved')} onCheckedChange={() => handleStatusChange('reserved')} />
                <Label htmlFor="status-reserved" className="cursor-pointer">Reservados</Label>
              </div>
              <Badge className="bg-status-reserved text-primary-foreground hover:bg-status-reserved/90">{statusCounts.reserved}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="status-sold" checked={selectedStatuses.has('sold')} onCheckedChange={() => handleStatusChange('sold')} />
                <Label htmlFor="status-sold" className="cursor-pointer">Contratados</Label>
              </div>
              <Badge variant="destructive">{statusCounts.sold}</Badge>
            </div>
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