import { useState, useEffect } from 'react';
import { InfoPanel } from './InfoPanel';
import { TagFilter } from './TagFilter';

export function MapFilter({ allPoints, onFilterChange }) {
  const [filteredPoints, setFilteredPoints] = useState(allPoints);

  const handleTagFilterChange = (selectedTagIds) => {
    let newFilteredPoints;
    if (selectedTagIds.length === 0) {
      newFilteredPoints = allPoints;
    } else {
      newFilteredPoints = allPoints.filter(point =>
        point.tags.some(tag => selectedTagIds.includes(tag.id))
      );
    }
    setFilteredPoints(newFilteredPoints);
    onFilterChange(newFilteredPoints);
  };

  // Atualiza os pontos filtrados quando a lista principal de pontos é carregada
  useEffect(() => {
    setFilteredPoints(allPoints);
  }, [allPoints]);

  return (
    <div className="absolute top-4 left-4 z-10 w-full max-w-xs space-y-4">
      <InfoPanel points={filteredPoints} />
      <TagFilter onFilterChange={handleTagFilterChange} />
    </div>
  );
}