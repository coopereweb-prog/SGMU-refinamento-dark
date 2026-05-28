import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ZoomTimeline({ currentZoom, onZoomSelect, rules }) {
  const zoomLevels = Array.from({ length: 22 }, (_, i) => i + 1);

  return (
    <div className="relative">
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="flex w-max space-x-2 p-2">
          {zoomLevels.map(zoom => {
            const hasRule = rules.find(r => r.zoom_level === zoom);
            return (
              <Button
                key={zoom}
                variant={currentZoom === zoom ? "default" : "outline"}
                className={cn(
                  "h-12 w-12 relative",
                  hasRule?.display_mode === 'individual' && currentZoom !== zoom && "bg-green-50 hover:bg-green-100 border-green-200",
                  hasRule?.display_mode === 'cluster' && currentZoom !== zoom && "bg-blue-50 hover:bg-blue-100 border-blue-200"
                )}
                onClick={() => onZoomSelect(zoom)}
              >
                {zoom}
                {hasRule && (
                  <span className={cn(
                    "absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full",
                    hasRule.display_mode === 'individual' ? 'bg-green-500' : 'bg-blue-500'
                  )} />
                )}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}