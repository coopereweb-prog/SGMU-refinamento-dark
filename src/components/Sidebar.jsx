import { InfoPanel } from './InfoPanel';
import { TagFilter } from './TagFilter';

export function Sidebar({ points, onFilterChange }) {
  return (
    <div className="w-full h-full bg-background border-l flex flex-col p-4 space-y-4 overflow-y-auto">
      <InfoPanel points={points} />
      <TagFilter onFilterChange={onFilterChange} />
    </div>
  );
}