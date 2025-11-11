import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MVLBadgeProps {
  mvlWins: number;
  size?: "sm" | "md" | "lg";
}

export function MVLBadge({ mvlWins, size = "md" }: MVLBadgeProps) {
  if (mvlWins === 0) return null;

  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const badgeSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="default"
            className={`${badgeSize} gap-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold`}
            data-testid="badge-mvl"
          >
            <Trophy className={iconSize} />
            MVL x{mvlWins}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Most Valuable Lifter Award</p>
          <p className="text-xs text-muted-foreground">Won {mvlWins} time{mvlWins > 1 ? "s" : ""}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
