import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Target } from "lucide-react";

interface Challenge {
  id: string;
  text: string;
  completed: boolean;
}

interface DailyChallengesProps {
  challenges: Challenge[];
  onComplete?: (id: string, event: React.MouseEvent) => void;
}

export function DailyChallenges({ challenges: initialChallenges, onComplete }: DailyChallengesProps) {
  const [challenges, setChallenges] = useState(initialChallenges);

  const handleComplete = (id: string, event: React.MouseEvent) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: true } : c))
    );
    onComplete?.(id, event);
    console.log("Challenge completed:", id);
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          DAILY CHALLENGES
        </CardTitle>
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
                  size="sm"
                  onClick={(e) => handleComplete(challenge.id, e)}
                  data-testid={`button-complete-${challenge.id}`}
                >
                  Done (+15 XP)
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
