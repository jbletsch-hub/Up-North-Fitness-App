import { Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useViewContext } from "@/hooks/use-view-context";
import { Badge } from "@/components/ui/badge";

interface ViewContextSwitcherProps {
  crewName?: string;
  gymName?: string;
  disabled?: boolean;
}

export function ViewContextSwitcher({ 
  crewName = "My Crew", 
  gymName = "Up North Fitness",
  disabled = false 
}: ViewContextSwitcherProps) {
  const { viewContext, toggleViewContext, isCrewView, isGymView } = useViewContext();

  if (disabled) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-1 rounded-lg bg-muted/50 border">
      <Button
        variant={isCrewView ? "default" : "ghost"}
        size="sm"
        onClick={() => toggleViewContext()}
        disabled={!isCrewView && disabled}
        className="gap-2"
        data-testid="button-view-crew"
      >
        <Users className="w-4 h-4" />
        {crewName}
      </Button>
      <Button
        variant={isGymView ? "default" : "ghost"}
        size="sm"
        onClick={() => toggleViewContext()}
        disabled={isGymView && disabled}
        className="gap-2"
        data-testid="button-view-gym"
      >
        <Building2 className="w-4 h-4" />
        {gymName}
      </Button>
    </div>
  );
}
