import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function FilterPanel({ tags, onFilterChange }) {
  const [selectedTags, setSelectedTags] = React.useState([]);

  const handleTagChange = (tagId) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newSelectedTags);
    onFilterChange(newSelectedTags);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2">Características</h3>
        <div className="space-y-2">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag.id}`}
                onCheckedChange={() => handleTagChange(tag.id)}
                checked={selectedTags.includes(tag.id)}
              />
              <Label htmlFor={`tag-${tag.id}`}>{tag.name}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}