import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Target, RefreshCw, Sparkles } from "lucide-react";

interface Challenge {
  id: string;
  text: string;
  completed: boolean;
  xpValue?: number;
}

interface DailyChallengesProps {
  challenges: Challenge[];
  onComplete?: (id: string, position: { x: number; y: number }) => void;
  canReroll?: boolean;
  onReroll?: () => void;
  isRerolling?: boolean;
  has2XPBoost?: boolean;
}

export function DailyChallenges({ 
  challenges, 
  onComplete,
  canReroll = false,
  onReroll,
  isRerolling = false,
  has2XPBoost = false
}: DailyChallengesProps) {
  const handleComplete = (id: string, event: React.MouseEvent) => {
    console.log('[DEBUG] DailyChallenges handleComplete called for:', id);
    // Capture position synchronously before React recycles the event (production mode issue)
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top,
    };
    console.log('[DEBUG] Captured position:', position);
    console.log('[DEBUG] Calling onComplete callback');
    onComplete?.(id, position);
  };

  return (
    <Card className="border-card-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          DAILY CHALLENGES
        </CardTitle>
        {canReroll && onReroll && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReroll}
            disabled={isRerolling}
            data-testid="button-reroll-challenges"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRerolling ? 'animate-spin' : ''}`} />
            Reroll (1/day)
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-border ${
                challenge.completed ? "opacity-60" : ""
              }`}
              data-testid={`challenge-${challenge.id}`}
            >
              <div className="flex items-center gap-3 flex-1">
                {challenge.completed ? (
                  <Check className="h-5 w-5 text-chart-3 flex-shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                )}
                <span className={challenge.completed ? "line-through text-muted-foreground" : ""}>
                  {challenge.text}
                </span>
              </div>
              {challenge.completed ? (
                <Badge className="bg-chart-3 text-white border-0">✓</Badge>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => handleComplete(challenge.id, e)}
                  data-testid={`button-complete-${challenge.id}`}
                  className={has2XPBoost ? "gap-1" : ""}
                >
                  {has2XPBoost && <Sparkles className="h-3.5 w-3.5" />}
                  Done (+{has2XPBoost ? (challenge.xpValue || 20) * 2 : (challenge.xpValue || 20)} XP)
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
