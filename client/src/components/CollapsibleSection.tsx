import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  id: string; // Unique identifier for localStorage
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function CollapsibleSection({
  id,
  title,
  icon,
  children,
  defaultExpanded = true,
  className,
}: CollapsibleSectionProps) {
  const storageKey = `collapse-${id}`;
  
  // Load initial state from localStorage
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      return stored === "true";
    }
    return defaultExpanded;
  });

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(storageKey, String(isExpanded));
  }, [isExpanded, storageKey]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={cn("overflow-visible", className)} data-testid={`section-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleExpanded}
            data-testid={`button-toggle-${id}`}
            className="shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && <CardContent>{children}</CardContent>}
    </Card>
  );
}
