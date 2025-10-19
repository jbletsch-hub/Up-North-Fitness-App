import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target } from "lucide-react";

interface Goal {
  label: string;
  current: number;
  target: number;
  unit?: string;
}

interface GoalsCardProps {
  weeklyGoals: Goal[];
  lifetimeStats?: { label: string; value: number; unit?: string }[];
}

export function GoalsCard({ weeklyGoals, lifetimeStats }: GoalsCardProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Weekly Goals */}
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
            <Target className="h-5 w-5 text-chart-2" />
            WEEKLY GOALS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {weeklyGoals.map((goal, index) => {
            const progress = Math.min(100, (goal.current / goal.target) * 100);
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{goal.label}</span>
                  <span className="text-muted-foreground">
                    {goal.current} / {goal.target} {goal.unit || ""}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Lifetime Stats */}
      {lifetimeStats && lifetimeStats.length > 0 && (
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              LIFETIME STATS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lifetimeStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-muted-foreground">{stat.label}</span>
                <span className="font-display text-2xl text-primary">
                  {stat.value.toLocaleString()} {stat.unit || ""}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
