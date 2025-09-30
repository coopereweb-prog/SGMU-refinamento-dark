import { useState, useEffect } from 'react';
import { getTags } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function TagFilter({ onFilterChange }) {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      const tagsData = await getTags();
      setTags(tagsData);
      setLoading(false);
    };
    fetchTags();
  }, []);

  const handleTagChange = (tagId) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newSelectedTags);
    onFilterChange(newSelectedTags);
  };

  const clearFilters = () => {
    setSelectedTags([]);
    onFilterChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtrar por Característica</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
          ) : (
            tags.map(tag => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => handleTagChange(tag.id)}
                />
                <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer">{tag.name}</Label>
              </div>
            ))
          )}
        </div>
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Mostrar Todos os Pontos
        </Button>
      </CardContent>
    </Card>
  );
}